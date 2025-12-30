import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatEther } from "viem";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  balance?: bigint;
  disabled?: boolean;
}

export function AmountInput({
  value,
  onChange,
  balance,
  disabled = false,
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow valid decimal numbers
    if (/^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  const handleMax = () => {
    if (balance) {
      // Leave some for gas (0.001 ETH)
      const maxAmount = balance - BigInt(1e15);
      if (maxAmount > 0) {
        onChange(formatEther(maxAmount));
      }
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-eth"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
        </svg>
        <span className="text-muted-foreground font-medium">ETH</span>
      </div>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="0.0"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="h-14 pl-20 pr-20 text-xl font-mono bg-surface border-border focus:border-primary focus:ring-primary/20"
      />
      {balance !== undefined && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleMax}
          disabled={disabled || !balance}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary/80"
        >
          MAX
        </Button>
      )}
    </div>
  );
}
