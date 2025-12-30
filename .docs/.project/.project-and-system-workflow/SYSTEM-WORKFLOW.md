# ETH Cash Back - System Workflow

## Overview

This document describes the complete workflows for the ETH Cash Back system. Each workflow includes the sequence of operations, state transitions, and responsibilities of on-chain and off-chain components.

## Workflow Categories

1. Admin Workflows
2. User Workflows
3. System State Workflows

---

## Admin Workflows

### 1. Rule Registration Workflow

**Actor**: Admin (dApp operator)  
**Purpose**: Configure cashback parameters for a dApp integration

#### Preconditions
- Admin has wallet connected to Sepolia
- Admin has sufficient ETH for gas
- Contract is not paused

#### Workflow Steps

```
Step 1: Admin initiates rule registration
        [Off-chain: Admin fills form with rule parameters]
        
Step 2: Frontend constructs transaction
        [Off-chain: Encode registerRule call with parameters]
        
Step 3: Wallet prompts signature
        [Off-chain: Admin reviews and confirms in wallet]
        
Step 4: Transaction submitted to network
        [On-chain: Transaction enters mempool]
        
Step 5: Contract validates inputs
        [On-chain: Check percentage <= 1000, cap > 0, etc.]
        
Step 6: Contract generates rule ID
        [On-chain: keccak256(abi.encode(parameters, block.timestamp))]
        
Step 7: Contract stores rule
        [On-chain: rules[ruleId] = Rule{...}]
        
Step 8: Contract emits event
        [On-chain: emit RuleRegistered(ruleId, percentage, cap, validUntil)]
        
Step 9: Frontend receives confirmation
        [Off-chain: Transaction receipt with event logs]
        
Step 10: Admin receives rule ID
         [Off-chain: Display rule ID for future reference]
```

#### State Transitions

| State | Trigger | Next State |
|-------|---------|------------|
| No Rule | registerRule called | Rule Active |
| Rule Active | validUntil reached | Rule Expired |

#### Failure Scenarios

| Scenario | Response |
|----------|----------|
| Not admin | Revert with Unauthorized |
| Invalid percentage | Revert with InvalidPercentage |
| Zero cap | Revert with ZeroAmount |
| Contract paused | Revert with ContractPaused |
| Insufficient gas | Transaction fails |

---

### 2. Fund Deposit Workflow

**Actor**: Admin  
**Purpose**: Add ETH to contract for cashback distribution

#### Workflow Steps

```
Step 1: Admin sends ETH to contract address
        [On-chain: receive() fallback accepts ETH]
        
Step 2: Contract balance increases
        [On-chain: address(this).balance updated]
        
Step 3: Admin verifies balance
        [Off-chain: Query contract balance]
```

#### Notes
- No access control on deposits (anyone can fund)
- Contract must have balance >= expected cashback distributions

---

### 3. Fund Withdrawal Workflow

**Actor**: Admin  
**Purpose**: Retrieve unallocated funds from contract

#### Workflow Steps

```
Step 1: Admin calls withdrawFunds(amount)
        [On-chain: Require msg.sender == admin]
        
Step 2: Contract validates balance
        [On-chain: Require address(this).balance >= amount]
        
Step 3: Contract transfers ETH
        [On-chain: (bool success,) = admin.call{value: amount}("")]
        
Step 4: Admin receives ETH
        [On-chain: Admin balance updated]
```

---

## User Workflows

### 4. Wallet Connection Workflow

**Actor**: User  
**Purpose**: Authenticate with wallet to interact with system

#### Workflow Steps

```
Step 1: User clicks "Connect Wallet"
        [Off-chain: Frontend triggers wallet modal]
        
Step 2: Wallet provider selection
        [Off-chain: User selects MetaMask/WalletConnect]
        
Step 3: Wallet prompts connection approval
        [Off-chain: User approves site connection]
        
Step 4: Frontend receives address
        [Off-chain: useAccount() returns connected address]
        
Step 5: Network validation
        [Off-chain: Check chainId === 11155111 (Sepolia)]
        
Step 6: Wrong network handling
        [Off-chain: Prompt user to switch to Sepolia]
        
Step 7: Connection confirmed
        [Off-chain: Update UI to show connected state]
```

#### State Transitions

```
Disconnected → Connecting → Connected
                    │
                    └──→ Wrong Network → Connected (after switch)
                    │
                    └──→ Rejected → Disconnected
```

---

### 5. Transaction with Cashback Workflow

**Actor**: User  
**Purpose**: Execute transaction and receive ETH cashback

This is the primary user workflow.

#### Preconditions
- User wallet connected to Sepolia
- User has sufficient ETH for transaction + gas
- Active cashback rule exists
- User has not exceeded cumulative limit

#### Workflow Steps

```
Step 1: User enters transaction amount
        [Off-chain: Frontend receives amount input]
        
Step 2: Frontend calculates cashback preview
        [Off-chain: Call calculateCashback(ruleId, user, amount)]
        
Step 3: User reviews cashback preview
        [Off-chain: Display "You will receive X ETH cashback"]
        
Step 4: User clicks "Submit Transaction"
        [Off-chain: Frontend prepares transaction]
        
Step 5: Frontend calls processTransaction
        [Off-chain: writeContract({ value: amount })]
        
Step 6: Wallet prompts signature
        [Off-chain: User confirms in wallet]
        UI State: "Confirm in wallet..."
        
Step 7: Transaction submitted
        [On-chain: Transaction enters mempool]
        UI State: "Transaction pending..."
        
Step 8: Contract validates rule
        [On-chain: Check rules[ruleId].active]
        [On-chain: Check block.timestamp < rules[ruleId].validUntil]
        
Step 9: Contract validates user limit
        [On-chain: Check userUsage[user].totalReceived < cumulativeLimit]
        
Step 10: Contract calculates cashback
         [On-chain: cashback = min(amount * percentage / 10000, cap)]
         [On-chain: cashback = min(cashback, cumulativeLimit - totalReceived)]
         
Step 11: Contract updates usage (Effects)
         [On-chain: userUsage[user].totalReceived += cashback]
         [On-chain: userUsage[user].transactionCount++]
         
Step 12: Contract transfers cashback (Interactions)
         [On-chain: (bool success,) = user.call{value: cashback}("")]
         
Step 13: Contract emits event
         [On-chain: emit CashbackDistributed(user, cashback, ruleId)]
         
Step 14: Transaction confirmed
         [Off-chain: useWaitForTransactionReceipt returns success]
         UI State: "Transaction confirmed!"
         
Step 15: User receives cashback
         [On-chain: User balance increased by cashback amount]
         UI State: "You received X ETH cashback!"
```

#### State Diagram

```
                    ┌─────────────┐
                    │    Idle     │
                    └──────┬──────┘
                           │ Submit
                           ▼
                    ┌─────────────┐
                    │   Wallet    │
                    │   Confirm   │
                    └──────┬──────┘
                     Signed│ │Rejected
              ┌────────────┘ └────────────┐
              ▼                           ▼
       ┌─────────────┐             ┌─────────────┐
       │   Pending   │             │  Cancelled  │
       └──────┬──────┘             └─────────────┘
              │
        Mined │
       ┌──────┴──────┐
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│  Confirmed  │ │   Failed    │
│   + Show    │ │   (Revert)  │
│  Cashback   │ │   + Error   │
└─────────────┘ └─────────────┘
```

#### Failure Scenarios

| Scenario | Step | Response |
|----------|------|----------|
| Rule expired | 8 | Revert with RuleExpired |
| User limit exceeded | 9 | Revert with LimitExceeded |
| Contract underfunded | 12 | Revert with InsufficientFunds |
| Transfer failed | 12 | Revert with TransferFailed |
| Gas exhausted | Any | Transaction fails |
| User rejects | 6 | Return to idle |

#### Edge Cases

| Case | Handling |
|------|----------|
| Cashback = 0 | Transaction succeeds but no transfer |
| Partial limit remaining | Cashback capped to remaining limit |
| Concurrent transactions | Each processed independently |

---

### 6. Usage Query Workflow

**Actor**: User or Admin  
**Purpose**: Check current usage statistics

#### Workflow Steps

```
Step 1: Request user usage
        [Off-chain: Call getUserUsage(userAddress)]
        
Step 2: Contract returns data
        [On-chain: View function, no gas cost]
        
Step 3: Display usage
        [Off-chain: Show totalReceived, transactionCount]
```

---

## System State Workflows

### 7. Pause Workflow

**Actor**: Admin  
**Purpose**: Emergency halt of contract operations

#### Workflow Steps

```
Step 1: Admin calls pause()
        [On-chain: Require msg.sender == admin]
        
Step 2: Contract sets paused = true
        [On-chain: State variable updated]
        
Step 3: Contract emits Paused event
        [On-chain: emit Paused(admin)]
        
Step 4: All processTransaction calls blocked
        [On-chain: whenNotPaused modifier reverts]
```

#### Resume

```
Step 1: Admin calls unpause()
Step 2: Contract sets paused = false
Step 3: Contract emits Unpaused event
Step 4: Normal operations resume
```

---

### 8. Rule Expiration Workflow

**Actor**: System (automatic)  
**Purpose**: Rules become inactive after validity window

#### Workflow Steps

```
Step 1: Time passes
        [On-chain: block.timestamp increases]
        
Step 2: User calls processTransaction
        [On-chain: Contract checks validUntil]
        
Step 3: Rule expired check
        [On-chain: if (block.timestamp > validUntil) revert RuleExpired]
```

#### Notes
- No automatic state change occurs
- Expiration is checked at transaction time
- Expired rules remain in storage (no cleanup in MVP)

---

## Frontend State Machine

The frontend maintains the following state machine for transaction handling:

```
States:
- idle: Ready for new transaction
- wallet-confirm: Waiting for wallet signature
- pending: Transaction submitted, awaiting confirmation
- confirmed: Transaction successful
- cashback-received: Cashback confirmed (same as confirmed for MVP)
- error: Transaction failed

Transitions:
idle → wallet-confirm: User submits transaction
wallet-confirm → pending: Wallet signed
wallet-confirm → idle: User rejected
pending → confirmed: Transaction mined successfully
pending → error: Transaction reverted
confirmed → idle: User starts new transaction
error → idle: User dismisses error
```

## Event-Driven Updates

Frontend subscribes to contract events for real-time updates:

| Event | Action |
|-------|--------|
| RuleRegistered | Add to available rules list |
| CashbackDistributed | Update user balance, show success |
| Paused | Disable transaction form |
| Unpaused | Enable transaction form |

## Timing Considerations

| Operation | Expected Duration |
|-----------|-------------------|
| Wallet connection | 1-5 seconds |
| Transaction submission | 1-2 seconds |
| Transaction confirmation | 12-36 seconds (1-3 blocks on Sepolia) |
| RPC query | 100-500ms |
