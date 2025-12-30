import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";
import { WalletConnector } from "@/components/wallet/WalletConnector";
import { NetworkIndicator } from "@/components/wallet/NetworkIndicator";
import { TransactionForm } from "@/components/transaction/TransactionForm";
import { UserStats } from "@/components/transaction/UserStats";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";

const queryClient = new QueryClient();

function MainContent() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">ETH Cash Back</span>
          </div>
          <div className="flex items-center gap-3">
            <NetworkIndicator />
            <WalletConnector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          {/* Hero Card */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-glow">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">ETH Cash Back</h1>
              <p className="text-muted-foreground">
                Send ETH and receive instant cashback rewards
              </p>
            </div>

            {isConnected ? (
              <TransactionForm />
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Connect your wallet to start earning cashback on your transactions
                </p>
                <WalletConnector />
              </div>
            )}
          </div>

          {/* User Stats */}
          <UserStats />

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Contract:{" "}
              <a
                href="https://sepolia.etherscan.io/address/0x63b4889Ddf3e7889f39dAe1Cbd467D824b340cea"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline"
              >
                0x63b4...0cea
              </a>
            </p>
            <p className="mt-1">Ethereum Sepolia Testnet</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const Index = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MainContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Index;
