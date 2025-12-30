import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_CONFIG, CASHBACK_MANAGER_ABI } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import { AmountInput } from "./AmountInput";
import { CashbackPreview } from "./CashbackPreview";
import { TransactionStatus } from "./TransactionStatus";
import { Loader2, Send } from "lucide-react";

export function TransactionForm() {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>();

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  // Parse amount safely
  const parsedAmount = amount && parseFloat(amount) > 0 ? parseEther(amount) : BigInt(0);

  // Get rule details for percentage
  const { data: ruleData } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: CASHBACK_MANAGER_ABI,
    functionName: "getRule",
    args: [CONTRACT_CONFIG.ruleId as `0x${string}`],
  });

  // Calculate cashback preview
  const { data: cashbackPreview, isLoading: isLoadingPreview } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: CASHBACK_MANAGER_ABI,
    functionName: "calculateCashback",
    args: address
      ? [CONTRACT_CONFIG.ruleId as `0x${string}`, address, parsedAmount]
      : undefined,
    query: {
      enabled: !!address && parsedAmount > 0,
    },
  });

  // Process transaction
  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    reset: resetWrite,
    error: writeError,
  } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Update status based on transaction state
  useEffect(() => {
    if (isWritePending || isConfirming) {
      setTxStatus("pending");
    } else if (isSuccess) {
      setTxStatus("success");
    } else if (isError || writeError) {
      setTxStatus("error");
      setErrorMessage(writeError?.message || "Transaction failed");
    }
  }, [isWritePending, isConfirming, isSuccess, isError, writeError]);

  const handleSubmit = () => {
    if (!amount || !address || parsedAmount <= 0) return;

    setTxStatus("idle");
    setErrorMessage(undefined);

    writeContract({
      address: CONTRACT_CONFIG.address,
      abi: CASHBACK_MANAGER_ABI,
      functionName: "processTransaction",
      args: [CONTRACT_CONFIG.ruleId as `0x${string}`],
      value: parsedAmount,
    } as any);
  };

  const handleReset = () => {
    setAmount("");
    setTxStatus("idle");
    setErrorMessage(undefined);
    resetWrite();
  };

  const percentage = ruleData ? Number(ruleData[0]) : 200; // Default 2%
  const isValidAmount = parsedAmount > 0;
  const hasEnoughBalance = balance && parsedAmount <= balance.value;
  const canSubmit = isConnected && isValidAmount && hasEnoughBalance && txStatus !== "pending";

  return (
    <div className="w-full">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Amount
        </label>
        <AmountInput
          value={amount}
          onChange={setAmount}
          balance={balance?.value}
          disabled={txStatus === "pending"}
        />
        {balance && (
          <p className="text-sm text-muted-foreground">
            Balance:{" "}
            <span className="font-mono">
              {parseFloat(balance.formatted).toFixed(4)} ETH
            </span>
          </p>
        )}
        {isValidAmount && !hasEnoughBalance && (
          <p className="text-sm text-destructive">Insufficient balance</p>
        )}
      </div>

      <CashbackPreview
        cashback={cashbackPreview}
        percentage={percentage}
        isLoading={isLoadingPreview && isValidAmount}
      />

      <Button
        className="w-full h-12 text-base btn-press gap-2"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {txStatus === "pending" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Submit Transaction
          </>
        )}
      </Button>

      <TransactionStatus
        status={txStatus}
        hash={txHash}
        cashbackReceived={cashbackPreview}
        errorMessage={errorMessage}
        onRetry={handleSubmit}
        onClose={handleReset}
      />
    </div>
  );
}
