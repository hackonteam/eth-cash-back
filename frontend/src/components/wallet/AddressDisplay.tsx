import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface AddressDisplayProps {
  address: string;
  showCopy?: boolean;
  showEtherscan?: boolean;
  className?: string;
}

export function AddressDisplay({
  address,
  showCopy = true,
  showEtherscan = true,
  className = "",
}: AddressDisplayProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const openEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/address/${address}`, "_blank");
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="font-mono text-sm text-muted-foreground">
        {formatAddress(address)}
      </span>
      {showCopy && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={copyAddress}
        >
          <Copy className="h-3 w-3" />
        </Button>
      )}
      {showEtherscan && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={openEtherscan}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
