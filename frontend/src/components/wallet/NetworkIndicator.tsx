import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const EXPECTED_CHAIN_ID = 11155111; // Sepolia

export function NetworkIndicator() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;

  const isCorrectNetwork = chainId === EXPECTED_CHAIN_ID;

  if (isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-network/10 px-3 py-1.5 text-sm">
        <div className="h-2 w-2 rounded-full bg-network" />
        <span className="text-network font-medium">Sepolia</span>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => switchChain?.({ chainId: sepolia.id })}
      disabled={isPending}
      className="gap-2"
    >
      <AlertTriangle className="h-4 w-4" />
      {isPending ? "Switching..." : "Switch to Sepolia"}
    </Button>
  );
}
