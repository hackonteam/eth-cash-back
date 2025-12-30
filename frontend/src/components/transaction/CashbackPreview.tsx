import { formatEther } from "viem";
import { ArrowDown, Sparkles } from "lucide-react";

interface CashbackPreviewProps {
  cashback: bigint | undefined;
  percentage: number;
  isLoading?: boolean;
}

export function CashbackPreview({
  cashback,
  percentage,
  isLoading = false,
}: CashbackPreviewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <ArrowDown className="h-5 w-5 text-muted-foreground" />
        <div className="h-8 w-32 skeleton rounded" />
        <div className="h-4 w-24 skeleton rounded" />
      </div>
    );
  }

  const formattedCashback = cashback
    ? parseFloat(formatEther(cashback)).toFixed(6)
    : "0.000000";

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <ArrowDown className="h-5 w-5 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">Cashback</span>
      </div>
      <div className="eth-amount">{formattedCashback} ETH</div>
      <span className="text-sm text-muted-foreground">
        ({percentage / 100}% of transaction)
      </span>
    </div>
  );
}
