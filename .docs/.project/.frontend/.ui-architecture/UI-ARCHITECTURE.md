# ETH Cash Back - UI Architecture

## Overview

This document defines the UI component architecture for the ETH Cash Back frontend application built with Lovable. The architecture follows a component-based design with clear separation between presentation and logic.

## Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── NetworkIndicator
│   │   └── WalletConnector
│   ├── Main
│   │   └── [Page Content]
│   └── Footer
│
├── Pages
│   ├── TransactionPage
│   │   ├── TransactionForm
│   │   │   ├── AmountInput
│   │   │   ├── CashbackPreview
│   │   │   └── SubmitButton
│   │   └── TransactionStatus
│   │       ├── StatusIndicator
│   │       ├── HashLink
│   │       └── CashbackConfirmation
│   │
│   └── HistoryPage (optional)
│       └── TransactionList
│           └── TransactionItem
│
└── Shared Components
    ├── Modal
    ├── Button
    ├── Input
    ├── Spinner
    ├── Alert
    └── Card
```

## Core Components

### WalletConnector

**Purpose**: Handle wallet connection lifecycle.

**States**:
- disconnected: Show connect button
- connecting: Show loading indicator
- connected: Show address and disconnect option
- error: Show error with retry

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| onConnect | () => void | Called when connection succeeds |
| onDisconnect | () => void | Called when disconnect requested |

**Internal State**:
- isConnecting: boolean
- error: string | null

### NetworkIndicator

**Purpose**: Display current network and wrong-network warning.

**States**:
- correct-network: Green indicator, "Sepolia"
- wrong-network: Red warning, "Switch to Sepolia" button
- unknown: Gray indicator

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| expectedChainId | number | Target chain ID (11155111) |
| onSwitchNetwork | () => void | Network switch handler |

### AmountInput

**Purpose**: Collect ETH amount from user.

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| value | string | Input value |
| onChange | (value: string) => void | Change handler |
| balance | bigint | User ETH balance for max button |
| disabled | boolean | Disable during processing |

**Features**:
- Numeric validation
- Max button (set to balance minus gas estimate)
- ETH/USD toggle (optional)

### CashbackPreview

**Purpose**: Display calculated cashback before transaction.

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| amount | bigint | Transaction amount in wei |
| cashback | bigint | Calculated cashback in wei |
| loading | boolean | Calculation in progress |
| error | string | Error message if calculation failed |

**Display**:
```
Transaction: 1.0 ETH
Cashback:    0.02 ETH (2%)
───────────────────────
Net Cost:    0.98 ETH
```

### SubmitButton

**Purpose**: Trigger transaction submission.

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| onClick | () => void | Click handler |
| disabled | boolean | Disable state |
| loading | boolean | Show spinner |
| children | ReactNode | Button text |

**States by context**:
- "Connect Wallet" (not connected)
- "Switch Network" (wrong network)
- "Enter Amount" (no amount)
- "Submit Transaction" (ready)
- "Confirm in Wallet..." (waiting signature)
- "Processing..." (pending confirmation)

### TransactionStatus

**Purpose**: Display current transaction state.

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| status | TransactionState | Current state |
| hash | string | Transaction hash |
| cashbackReceived | bigint | Confirmed cashback |
| error | string | Error message |

**Status Display**:

| State | Icon | Message |
|-------|------|---------|
| idle | - | - |
| wallet-confirm | Wallet | "Confirm in your wallet" |
| pending | Spinner | "Transaction pending..." |
| confirmed | Check | "Transaction confirmed!" |
| error | Alert | Error message |

### HashLink

**Purpose**: Clickable link to block explorer.

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| hash | string | Transaction hash |
| chainId | number | Chain ID for explorer URL |

**Rendered**:
```
0x1234...5678 ↗
```

Links to: `https://sepolia.etherscan.io/tx/{hash}`

## State Management

### Transaction State

```typescript
type TransactionState = 
  | 'idle'
  | 'wallet-confirm'
  | 'pending'
  | 'confirmed'
  | 'error';

interface TransactionContext {
  state: TransactionState;
  hash: string | null;
  error: string | null;
  cashbackReceived: bigint | null;
  
  // Actions
  submit: (amount: bigint) => void;
  reset: () => void;
}
```

### Wallet State

```typescript
interface WalletContext {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: bigint | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  switchNetwork: (chainId: number) => void;
}
```

## Data Flow

### Amount to Cashback Preview

```
User types amount
       │
       ▼
AmountInput onChange
       │
       ▼
Debounce (300ms)
       │
       ▼
Call calculateCashback()
       │
       ▼
Update CashbackPreview
```

### Transaction Submission

```
User clicks Submit
       │
       ▼
Disable form inputs
       │
       ▼
Call processTransaction()
       │
       ▼
Watch for wallet response
       │
       ├─── User rejects → Reset to idle
       │
       ▼
Hash received → State: pending
       │
       ▼
Wait for confirmation
       │
       ├─── Confirmed → State: confirmed
       │                Parse cashback from event
       │                Re-enable form
       │
       └─── Failed → State: error
                     Display error message
                     Re-enable form
```

## Responsive Design

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| mobile | < 640px | Single column, full-width inputs |
| tablet | 640-1024px | Centered card, medium padding |
| desktop | > 1024px | Centered card, large padding |

### Component Adaptations

**WalletConnector**:
- Mobile: Truncated address (0x12...34)
- Desktop: Longer address (0x1234...5678)

**TransactionForm**:
- Mobile: Stack vertically
- Desktop: Inline preview

## Accessibility

### Requirements

- All interactive elements keyboard accessible
- Focus indicators visible
- Form inputs have associated labels
- Status changes announced to screen readers
- Color not sole indicator of state

### ARIA Patterns

```html
<button aria-busy="true" aria-label="Transaction processing">
  <Spinner /> Processing...
</button>

<div role="status" aria-live="polite">
  Transaction confirmed!
</div>

<input
  aria-label="Transaction amount in ETH"
  aria-describedby="balance-hint"
/>
```

## Error Handling

### User-Facing Errors

| Contract Error | User Message |
|----------------|--------------|
| RuleExpired | "Cashback offer has expired" |
| LimitExceeded | "You've reached your cashback limit" |
| InsufficientFunds | "Service temporarily unavailable" |
| TransferFailed | "Transaction failed, please retry" |
| ContractPaused | "Service temporarily paused" |

### Network Errors

| Error | User Message |
|-------|--------------|
| RPC timeout | "Network connection issue, retrying..." |
| User rejected | "Transaction cancelled" |
| Nonce error | "Please try again" |
| Gas estimation failed | "Unable to estimate gas, please try again" |

## Component States

### Loading States

All async operations show loading indicators:
- calculateCashback: Skeleton in preview
- balance fetch: Skeleton in max button
- transaction submit: Spinner in button
- confirmation wait: Status spinner

### Empty States

- No transactions: "Your first cashback awaits!"
- Wallet not connected: "Connect wallet to get started"

### Error States

- Always include retry action
- Error message + icon
- Non-blocking when possible
