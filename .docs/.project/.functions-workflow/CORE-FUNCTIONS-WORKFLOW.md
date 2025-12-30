# Function Workflow: Core Contract Functions

## Overview

This document describes the step-by-step workflows for executing each function, from user/admin initiation through completion, including all system and user interactions.

---

## Register Cashback Rule Workflow

### Actors
- Admin (dApp operator)

### Preconditions
1. Admin has wallet connected to Sepolia
2. Admin address matches contract admin
3. Contract is not paused
4. Admin has sufficient ETH for gas

### Workflow Diagram

```
Admin                    Frontend                   Contract                 Blockchain
  │                         │                          │                         │
  │ Fill Rule Form          │                          │                         │
  ├────────────────────────►│                          │                         │
  │                         │                          │                         │
  │                         │ Validate Inputs          │                         │
  │                         │ (client-side)            │                         │
  │                         │                          │                         │
  │ Click "Register"        │                          │                         │
  ├────────────────────────►│                          │                         │
  │                         │                          │                         │
  │                         │ Encode Transaction       │                         │
  │                         ├─────────────────────────►│                         │
  │                         │                          │                         │
  │ Wallet Popup            │                          │                         │
  │◄────────────────────────┤                          │                         │
  │                         │                          │                         │
  │ Confirm Signature       │                          │                         │
  ├────────────────────────►│                          │                         │
  │                         │                          │                         │
  │                         │                          │ Submit TX              │
  │                         │                          ├────────────────────────►│
  │                         │                          │                         │
  │                         │                          │ Validate & Store       │
  │                         │                          │◄────────────────────────┤
  │                         │                          │                         │
  │                         │                          │ Emit RuleRegistered    │
  │                         │                          │────────────────────────►│
  │                         │                          │                         │
  │                         │◄─────────────────────────┤ Receipt + Events       │
  │                         │                          │                         │
  │ Display Rule ID         │                          │                         │
  │◄────────────────────────┤                          │                         │
  │                         │                          │                         │
```

### Step-by-Step

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | Admin | Opens admin interface | Form displayed |
| 2 | Admin | Enters percentage (e.g., 200 for 2%) | Input validated |
| 3 | Admin | Enters cap (e.g., 0.1 ETH) | Input converted to wei |
| 4 | Admin | Enters cumulative limit (e.g., 0.5 ETH) | Input converted to wei |
| 5 | Admin | Enters validity window (e.g., 30 days) | Input converted to seconds |
| 6 | Admin | Clicks "Register Rule" | Transaction prepared |
| 7 | System | Encodes registerRule call | - |
| 8 | Wallet | Prompts for signature | Admin reviews |
| 9 | Admin | Confirms transaction | TX submitted |
| 10 | Contract | Validates inputs | Pass/Fail |
| 11 | Contract | Generates rule ID | keccak256 hash |
| 12 | Contract | Stores rule | State updated |
| 13 | Contract | Emits event | RuleRegistered |
| 14 | Frontend | Receives receipt | Success/Fail |
| 15 | Frontend | Displays rule ID | Admin copies for integration |

### Failure Handling

| Failure Point | Detection | Recovery |
|---------------|-----------|----------|
| Invalid inputs | Step 10 (revert) | Display error, user retries |
| Not admin | Step 10 (revert) | Display "Unauthorized" |
| Contract paused | Step 10 (revert) | Display "Contract Paused" |
| Gas exhausted | Step 9 | Transaction fails, retry |
| User rejects | Step 9 | Return to form |

---

## Process Transaction Workflow

### Actors
- User (wallet holder)

### Preconditions
1. User has wallet connected to Sepolia
2. Active cashback rule exists
3. User has not exceeded cumulative limit
4. User has sufficient ETH for transaction + gas
5. Contract has sufficient balance for cashback

### Workflow Diagram

```
User                     Frontend                   Contract                 Blockchain
  │                         │                          │                         │
  │ Enter Amount            │                          │                         │
  ├────────────────────────►│                          │                         │
  │                         │                          │                         │
  │                         │ calculateCashback()      │                         │
  │                         ├─────────────────────────►│                         │
  │                         │                          │                         │
  │                         │◄─────────────────────────┤ cashback amount         │
  │                         │                          │                         │
  │ See Preview             │                          │                         │
  │◄────────────────────────┤                          │                         │
  │                         │                          │                         │
  │ Click "Submit"          │                          │                         │
  ├────────────────────────►│                          │                         │
  │                         │                          │                         │
  │ Wallet Popup            │                          │                         │
  │◄────────────────────────┤ State: "wallet-confirm"  │                         │
  │                         │                          │                         │
  │ Confirm                 │                          │                         │
  ├────────────────────────►│                          │                         │
  │                         │                          │                         │
  │ "Pending..."            │ State: "pending"         │ Submit TX              │
  │◄────────────────────────┤─────────────────────────►├────────────────────────►│
  │                         │                          │                         │
  │                         │                          │ Validate & Execute     │
  │                         │                          │◄────────────────────────┤
  │                         │                          │                         │
  │                         │                          │ Update Usage           │
  │                         │                          │ Transfer Cashback      │
  │                         │                          │ Emit Event             │
  │                         │                          │────────────────────────►│
  │                         │                          │                         │
  │ "Confirmed!"            │◄─────────────────────────┤ Receipt + Events       │
  │ "Received X ETH"        │ State: "confirmed"       │                         │
  │◄────────────────────────┤                          │                         │
```

### Step-by-Step

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Enters transaction amount | Amount displayed |
| 2 | Frontend | Calls calculateCashback() | Preview fetched |
| 3 | User | Views cashback preview | "You will receive X ETH" |
| 4 | User | Clicks "Submit Transaction" | Button disabled |
| 5 | Frontend | Prepares transaction | State → wallet-confirm |
| 6 | Wallet | Prompts signature | Shows value + gas |
| 7 | User | Confirms in wallet | TX submitted |
| 8 | Frontend | Updates UI | State → pending |
| 9 | Contract | Validates rule | Check active, not expired |
| 10 | Contract | Validates limits | Check user limit |
| 11 | Contract | Calculates cashback | Apply formula |
| 12 | Contract | Updates usage | Write to storage |
| 13 | Contract | Transfers cashback | ETH to user |
| 14 | Contract | Emits event | CashbackDistributed |
| 15 | Frontend | Receives receipt | State → confirmed |
| 16 | Frontend | Displays result | Shows cashback received |
| 17 | User | Balance increased | ETH in wallet |

### State Transitions

```
idle ──[submit]──► wallet-confirm ──[sign]──► pending ──[mined]──► confirmed
                         │                        │
                    [reject]                  [revert]
                         │                        │
                         ▼                        ▼
                       idle                     error
```

### Failure Handling

| Failure Point | Detection | User Experience | Recovery |
|---------------|-----------|-----------------|----------|
| Rule expired | Step 9 | "Rule has expired" | None (rule invalid) |
| Limit exceeded | Step 10 | "Limit reached" | None (use different rule) |
| Insufficient funds | Step 13 | "Contract underfunded" | Contact admin |
| Transfer failed | Step 13 | "Transfer failed" | Retry transaction |
| Gas exhausted | Step 7 | Transaction fails | Increase gas, retry |
| User rejects | Step 7 | Return to form | Click submit again |

---

## Query Usage Workflow

### Actors
- User or Admin

### Workflow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Views profile/stats page | Page loads |
| 2 | Frontend | Calls getUserUsage(address) | View call (no gas) |
| 3 | Contract | Returns usage data | totalReceived, count, lastUpdated |
| 4 | Frontend | Displays statistics | Formatted display |

### Data Display

```
Your Cashback Summary
─────────────────────
Total Received: 0.25 ETH
Transactions:   5
Last Activity:  Dec 28, 2024

Remaining Limit: 0.25 ETH of 0.5 ETH
[███████░░░░░░░░] 50%
```

---

## Pause/Unpause Workflow

### Actors
- Admin

### Pause Workflow

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | Admin | Clicks "Pause Contract" | Confirmation modal |
| 2 | Admin | Confirms action | Transaction prepared |
| 3 | Wallet | Prompts signature | Admin reviews |
| 4 | Admin | Signs transaction | TX submitted |
| 5 | Contract | Sets paused = true | State updated |
| 6 | Contract | Emits Paused event | Event logged |
| 7 | Frontend | Receives confirmation | UI updates |
| 8 | All Users | See "Contract Paused" | Submit disabled |

### Unpause Workflow

Same as above, but sets paused = false and emits Unpaused event.

---

## Fund Management Workflows

### Deposit Funds

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | Admin | Sends ETH to contract address | Standard transfer |
| 2 | Contract | Receives ETH | Balance increases |
| 3 | Admin | Verifies balance | Query balance |

### Withdraw Funds

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | Admin | Enters withdrawal amount | Form displayed |
| 2 | Admin | Clicks "Withdraw" | Transaction prepared |
| 3 | Wallet | Prompts signature | Admin reviews |
| 4 | Admin | Signs transaction | TX submitted |
| 5 | Contract | Validates amount | Check balance |
| 6 | Contract | Transfers to admin | ETH sent |
| 7 | Contract | Emits event | FundsWithdrawn |
| 8 | Admin | Receives ETH | Balance increases |

---

## Error Recovery Matrix

| Error State | User Sees | Next Steps |
|------------|-----------|------------|
| Wallet not connected | "Connect Wallet" | Click connect button |
| Wrong network | "Switch to Sepolia" | Click switch button |
| Insufficient ETH | "Not enough ETH" | Add funds to wallet |
| Rule expired | "Rule expired" | Wait for new rule |
| Limit reached | "Limit reached" | Wait for new period |
| Contract paused | "Temporarily unavailable" | Wait for unpause |
| Transaction failed | "Failed: [reason]" | Retry or adjust |
| Unknown error | "Something went wrong" | Refresh, retry |
