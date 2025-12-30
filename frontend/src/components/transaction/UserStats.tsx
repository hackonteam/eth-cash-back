import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_CONFIG, CASHBACK_MANAGER_ABI } from "@/lib/contracts";
import { TrendingUp, Hash, Clock } from "lucide-react";

export function UserStats() {
  const { address, isConnected } = useAccount();

  const { data: userUsage, isLoading } = useReadContract({
    address: CONTRACT_CONFIG.address,
    abi: CASHBACK_MANAGER_ABI,
    functionName: "getUserUsage",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  if (!isConnected || !address) return null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-4">
            <div className="h-4 w-20 skeleton rounded mb-2" />
            <div className="h-6 w-16 skeleton rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!userUsage) return null;

  const [totalReceived, transactionCount, lastUpdated] = userUsage;

  const formatDate = (timestamp: bigint) => {
    if (timestamp === BigInt(0)) return "Never";
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div className="rounded-lg border border-border bg-surface p-4 card-hover">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <TrendingUp className="h-4 w-4" />
          Total Cashback
        </div>
        <div className="font-mono font-semibold text-lg">
          {parseFloat(formatEther(totalReceived)).toFixed(4)} ETH
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 card-hover">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Hash className="h-4 w-4" />
          Transactions
        </div>
        <div className="font-semibold text-lg">{transactionCount.toString()}</div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 card-hover">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
          <Clock className="h-4 w-4" />
          Last Activity
        </div>
        <div className="font-semibold text-lg">{formatDate(lastUpdated)}</div>
      </div>
    </div>
  );
}
