# ETH Cash Back - UX Architecture

## Overview

This document defines the user experience architecture for ETH Cash Back. The UX is designed to be Web3-native, transaction-centric, and minimal, prioritizing clarity over feature density.

## Design Philosophy

### Core Principles

1. **Transaction-Centric**: Every UI element supports the transaction flow
2. **Explicit State**: Users always know what is happening
3. **Web3-Native**: Wallet interactions feel natural, not retrofitted
4. **Minimal**: No dashboard bloat, no speculative features
5. **Forgiving**: Errors are recoverable, actions are reversible

### Anti-Patterns (What We Avoid)

- Analytics dashboards with fake metrics
- Complex settings panels
- Multi-step wizards
- Gamification elements
- Social features
- Token mechanics display

## User Personas

### Primary: dApp User

**Context**: Interacting with a dApp that integrates ETH Cash Back.

**Goals**:
- Complete transaction
- Receive cashback
- Understand what happened

**Technical Level**: Has used Web3 before, owns ETH, has wallet.

### Secondary: dApp Admin

**Context**: Configuring cashback rules.

**Goals**:
- Set up cashback parameters
- Monitor contract balance
- Pause if needed

**Technical Level**: Comfortable with smart contracts, testnet operations.

## User Flows

### Flow 1: First-Time Transaction

```
[Landing Page]
     │
     ▼ User arrives
[Connect Wallet Prompt]
     │
     ▼ Clicks "Connect Wallet"
[Wallet Selection Modal]
     │
     ▼ Selects MetaMask/WalletConnect
[Wallet Approval Pop-up]
     │
     ▼ Approves connection
[Network Check]
     │
     ├─── Correct network ───▶ [Transaction Form]
     │
     └─── Wrong network ───▶ [Switch Network Prompt]
                                    │
                                    ▼ Approves switch
                              [Transaction Form]
```

### Flow 2: Execute Transaction

```
[Transaction Form]
     │
     ▼ User enters amount
[Cashback Preview Updates]
     │
     ▼ User clicks "Submit"
[Wallet Signature Request]
     │
     ├─── User rejects ───▶ [Return to Form]
     │
     ▼ User signs
[Pending State]
     │ "Transaction pending..."
     │ Hash displayed, links to explorer
     │
     ├─── Transaction fails ───▶ [Error State with Retry]
     │
     ▼ Transaction confirmed (12-36 seconds)
[Success State]
     │ "Transaction confirmed!"
     │ "You received X ETH cashback"
     │
     ▼ Auto-reset after 5 seconds OR user clicks "New Transaction"
[Transaction Form - Ready for next]
```

### Flow 3: Limit Reached

```
[Transaction Form]
     │
     ▼ User enters amount
[Cashback Preview = 0]
     │ "You've reached your cashback limit"
     │
     ▼ User may still submit (aware of no cashback)
[Standard Transaction Flow]
```

## State Displays

### Transaction States

The UI must clearly display these five states:

| State | Visual | Message | Actions |
|-------|--------|---------|---------|
| idle | Form active | - | Submit enabled |
| wallet-confirm | Form disabled, wallet icon | "Confirm in your wallet" | Wait or cancel |
| pending | Spinner, hash link | "Processing transaction..." | Wait, view on explorer |
| confirmed | Checkmark, success color | "Confirmed! +X ETH cashback" | New transaction |
| error | Alert icon, error color | Error message | Retry, dismiss |

### State Transition Animations

- idle → wallet-confirm: Button transforms to "Confirm in wallet..."
- wallet-confirm → pending: Smooth fade to pending card
- pending → confirmed: Card expands with success animation
- Any → error: Shake + error color transition

### Timing Expectations

Communicate expected wait times:

| State | Expected Duration | Display |
|-------|-------------------|---------|
| wallet-confirm | 1-30 seconds | "Waiting for wallet..." |
| pending | 12-36 seconds | "Usually takes ~15 seconds" |

## Feedback Mechanisms

### Immediate Feedback

Every user action produces immediate visual response:

| Action | Feedback |
|--------|----------|
| Connect button hover | Background color change |
| Connect button click | Loading spinner |
| Amount input change | Cashback preview update (debounced) |
| Submit button click | State change to wallet-confirm |
| Transaction signed | State change to pending |
| Transaction confirmed | Success animation |

### Delayed Feedback

For async operations, show progress:

- Cashback calculation: Skeleton loader in preview
- Balance fetch: Skeleton loader
- Transaction confirmation: Block countdown (optional)

### Error Feedback

Errors display:
- What went wrong (user-friendly message)
- Why it might have happened (optional context)
- What to do next (retry button, suggestion)

## Information Architecture

### What Users Need to Know

**Before Transaction**:
- Connected wallet address
- Current network
- ETH balance
- Expected cashback

**During Transaction**:
- Current state (wallet-confirm/pending)
- Transaction hash (click to view)
- Estimated wait time

**After Transaction**:
- Confirmation status
- Cashback received
- Link to explorer

### What Users Do Not Need

- Historical analytics
- Leaderboards
- Token balances (not applicable)
- Complex configuration
- Multiple rule selection (MVP uses single rule)

## Navigation Structure

### MVP: Single Page

```
[Header: Logo | Network | Wallet]
[Main: Transaction Form + Status]
[Footer: Links]
```

No additional navigation needed for MVP single-rule implementation.

### Potential Extensions (Post-MVP)

- History tab (past transactions)
- Admin panel (separate route)

## Wallet Interaction Patterns

### Connection Flow

1. Show connection options (MetaMask, WalletConnect)
2. User selects wallet
3. Wallet opens, prompts connection approval
4. User approves → Connected state
5. User rejects → Return to connection options

### Network Handling

1. After connection, check chainId
2. If wrong network, show prominent warning
3. Provide one-click "Switch Network" button
4. Switch triggers wallet prompt
5. After switch, automatically refresh state

### Transaction Signing

1. Prepare transaction data
2. Show clear summary: Amount + Gas + Cashback
3. Submit to wallet
4. Wallet shows native confirmation UI
5. Handle sign/reject/timeout

## Cognitive Load Management

### Progressive Disclosure

Show information when relevant:
- Cashback preview appears after amount entered
- Transaction hash appears after signing
- Error details expand on click

### Reduced Choices

- Single cashback rule (not selectable in MVP)
- One action button (context-dependent label)
- No settings or preferences

### Clear Defaults

- Gas estimation automatic
- Rule selection automatic
- Network detection automatic

## Accessibility Considerations

### Keyboard Navigation

- Tab order: Connect → Amount → Submit
- Enter to submit when focused
- Escape to dismiss modals

### Screen Reader Support

- Form inputs labeled
- State changes announced
- Buttons have descriptive text
- Error messages associated with inputs

### Visual Accessibility

- High contrast text
- Color not sole indicator
- Focus indicators visible
- Minimum touch target 44x44px

## Mobile Considerations

### Touch Targets

- Buttons minimum 44x44px
- Generous tap areas
- No hover-only interactions

### Mobile Wallet Integration

- Deep links to mobile wallets
- WalletConnect for mobile connection
- Handle app switching gracefully

### Viewport Handling

- Fixed header with wallet connection
- Scrollable content area
- No horizontal scrolling

## Error Recovery

### User Errors

| Error | Recovery |
|-------|----------|
| Amount exceeds balance | Show balance, suggest max |
| Wrong network | One-click switch |
| Wallet not connected | Prompt connection |

### System Errors

| Error | Recovery |
|-------|----------|
| RPC timeout | Auto-retry with backoff |
| Transaction failed | Retry button |
| Contract error | Clear message, retry |

### Graceful Degradation

- If cashback calculation fails, show "Unable to preview"
- If balance fails to load, disable max button but allow manual input
- If network detection fails, allow manual input
