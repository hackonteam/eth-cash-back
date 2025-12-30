# ETH Cash Back - Frontend Architecture

## Overview

This document defines the technical architecture for the ETH Cash Back frontend application built with Lovable framework.

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Lovable | Latest | Application framework |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |

### Web3 Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| wagmi | 2.x | React hooks for Ethereum |
| viem | 2.x | TypeScript Ethereum library |
| @rainbow-me/rainbowkit | 2.x | Wallet connection UI (optional) |

### Styling

| Technology | Purpose |
|------------|---------|
| CSS Variables | Design tokens |
| CSS Modules or Tailwind | Component styling |

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Spinner.tsx
│   │   ├── wallet/
│   │   │   ├── WalletConnector.tsx
│   │   │   ├── NetworkIndicator.tsx
│   │   │   └── AddressDisplay.tsx
│   │   └── transaction/
│   │       ├── TransactionForm.tsx
│   │       ├── AmountInput.tsx
│   │       ├── CashbackPreview.tsx
│   │       └── TransactionStatus.tsx
│   ├── hooks/
│   │   ├── useTransaction.ts
│   │   ├── useCashbackPreview.ts
│   │   └── useUserUsage.ts
│   ├── lib/
│   │   ├── wagmi.ts
│   │   ├── contracts.ts
│   │   └── utils.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── tokens.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Configuration

### Wagmi Configuration

```typescript
// src/lib/wagmi.ts
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,
    }),
  ],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL),
  },
});
```

### Contract Configuration

```typescript
// src/lib/contracts.ts
export const CASHBACK_MANAGER = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
  abi: [...] as const,
} as const;

export const RULE_ID = import.meta.env.VITE_RULE_ID as `0x${string}`;
```

### Environment Variables

```
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/xxx
VITE_WC_PROJECT_ID=xxx
VITE_CONTRACT_ADDRESS=0x...
VITE_RULE_ID=0x...
```

## Custom Hooks

### useTransaction

Manages transaction submission and status tracking.

```typescript
interface UseTransactionReturn {
  state: TransactionState;
  hash: string | null;
  error: string | null;
  cashbackReceived: bigint | null;
  submit: (amount: bigint) => void;
  reset: () => void;
}

function useTransaction(ruleId: string): UseTransactionReturn {
  // Implementation uses wagmi hooks:
  // - useWriteContract for submission
  // - useWaitForTransactionReceipt for confirmation
  // - Parse CashbackDistributed event for cashback amount
}
```

### useCashbackPreview

Fetches cashback preview for given amount.

```typescript
interface UseCashbackPreviewReturn {
  cashback: bigint | null;
  isLoading: boolean;
  error: string | null;
}

function useCashbackPreview(
  amount: bigint,
  user: string,
  ruleId: string
): UseCashbackPreviewReturn {
  // Implementation uses useReadContract with debounce
}
```

### useUserUsage

Fetches user's usage statistics.

```typescript
interface UseUserUsageReturn {
  totalReceived: bigint | null;
  transactionCount: bigint | null;
  lastUpdated: bigint | null;
  isLoading: boolean;
}

function useUserUsage(user: string): UseUserUsageReturn {
  // Implementation uses useReadContract
}
```

## State Management

### Local State

React useState for component-level state:
- Form input values
- UI state (modals, dropdowns)

### Server State (wagmi)

wagmi manages blockchain state:
- Account connection
- Network status
- Contract reads (cached)
- Transaction status

### No Global State Store Needed

MVP is simple enough that React context + wagmi handles all state. No Redux/Zustand required.

## Data Fetching Patterns

### Contract Reads

Use wagmi's useReadContract with appropriate staleTime:

```typescript
const { data: cashback } = useReadContract({
  address: CASHBACK_MANAGER.address,
  abi: CASHBACK_MANAGER.abi,
  functionName: 'calculateCashback',
  args: [ruleId, userAddress, amount],
  query: {
    enabled: amount > 0n,
    staleTime: 10_000, // 10 seconds
  },
});
```

### Contract Writes

Use wagmi's useWriteContract + useWaitForTransactionReceipt:

```typescript
const { writeContract, data: hash } = useWriteContract();

const { isLoading, isSuccess, data: receipt } = useWaitForTransactionReceipt({
  hash,
});
```

### Balance Queries

Use wagmi's useBalance for ETH balance:

```typescript
const { data: balance } = useBalance({
  address: userAddress,
  watch: true,
});
```

## Error Handling

### Contract Errors

Parse revert reasons from contract calls:

```typescript
function parseContractError(error: unknown): string {
  if (error instanceof ContractFunctionExecutionError) {
    const revertError = error.cause;
    // Map contract errors to user messages
    switch (revertError.errorName) {
      case 'RuleExpired': return 'Cashback offer has expired';
      case 'LimitExceeded': return 'You have reached your cashback limit';
      // ...
    }
  }
  return 'An unexpected error occurred';
}
```

### Network Errors

Handle RPC and network issues:

```typescript
function handleNetworkError(error: unknown): string {
  if (error instanceof TimeoutError) {
    return 'Network timeout. Please try again.';
  }
  // ...
}
```

## Build Configuration

### Vite Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          wagmi: ['wagmi', 'viem'],
        },
      },
    },
  },
});
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing Strategy

### Unit Tests

Test individual hooks and utilities:
- useCashbackPreview calculation
- Error message parsing
- Formatting utilities

### Integration Tests

Test component interactions:
- Form submission flow
- Wallet connection flow

### E2E Tests (optional)

Playwright tests against local Hardhat node:
- Full transaction flow
- Error scenarios

## Performance Considerations

### Bundle Size

- Tree-shake wagmi/viem
- Lazy load wallet connectors
- Code-split by route (if multiple pages)

### RPC Optimization

- Cache contract reads (wagmi handles this)
- Debounce preview calculations
- Use appropriate polling intervals

### Rendering

- Memoize expensive calculations
- Use React.memo for static components
- Avoid excessive re-renders on balance updates

## Deployment

### Build

```bash
npm run build
```

Outputs static files to `dist/`.

### Environment

Set environment variables in deployment platform:
- VITE_SEPOLIA_RPC_URL
- VITE_WC_PROJECT_ID
- VITE_CONTRACT_ADDRESS
- VITE_RULE_ID

### Hosting

Any static hosting:
- Vercel
- Netlify
- GitHub Pages
- IPFS

## Security Considerations

### No Private Keys

Frontend never handles private keys. All signing via wallet.

### Environment Variables

Build-time secrets only. No runtime secrets in client.

### Input Validation

Validate amounts client-side before submission.

### RPC Security

Use authenticated RPC endpoints in production.
