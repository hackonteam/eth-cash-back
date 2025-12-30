import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEther } from "viem";

type Status = "idle" | "pending" | "success" | "error";

interface TransactionStatusProps {
  status: Status;
  hash?: string;
  cashbackReceived?: bigint;
  errorMessage?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export function TransactionStatus({
  status,
  hash,
  cashbackReceived,
  errorMessage,
  onRetry,
  onClose,
}: TransactionStatusProps) {
  if (status === "idle") return null;

  const openEtherscan = () => {
    if (hash) {
      window.open(`https://sepolia.etherscan.io/tx/${hash}`, "_blank");
    }
  };

  return (
    <div className="mt-6 rounded-lg border border-border bg-surface p-6">
      {status === "pending" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Transaction Pending</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Waiting for confirmation...
            </p>
          </div>
          {hash && (
            <Button
              variant="outline"
              size="sm"
              onClick={openEtherscan}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Etherscan
            </Button>
          )}
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-success/20 p-3">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-success">
              Transaction Confirmed!
            </h3>
            {cashbackReceived && (
              <p className="text-sm text-muted-foreground mt-1">
                You received{" "}
                <span className="font-mono font-semibold text-foreground">
                  {parseFloat(formatEther(cashbackReceived)).toFixed(6)} ETH
                </span>{" "}
                cashback
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {hash && (
              <Button
                variant="outline"
                size="sm"
                onClick={openEtherscan}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on Etherscan
              </Button>
            )}
            {onClose && (
              <Button size="sm" onClick={onClose}>
                New Transaction
              </Button>
            )}
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/20 p-3">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-destructive">
              Transaction Failed
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {errorMessage || "Something went wrong. Please try again."}
            </p>
          </div>
          <div className="flex gap-2">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Try Again
              </Button>
            )}
            {hash && (
              <Button
                variant="ghost"
                size="sm"
                onClick={openEtherscan}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Details
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
