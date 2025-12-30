# Function Detail: Get User Usage

## Function Signature

```solidity
function getUserUsage(
    address user
) external view returns (
    uint256 totalReceived,
    uint256 transactionCount,
    uint256 lastUpdated
)
```

## Description

Retrieves the usage statistics for a specific user address. Returns the cumulative cashback received, number of transactions processed, and timestamp of the last transaction.

## Parameters

### user (address)

The user address to query.

| Property | Value |
|----------|-------|
| Type | address |
| Validation | None (zero/unknown address returns zeroes) |

## Return Values

### totalReceived (uint256)

Cumulative cashback received by the user in wei.

| Property | Value |
|----------|-------|
| Unit | Wei |
| Range | 0 - cumulativeLimit |

### transactionCount (uint256)

Number of cashback transactions the user has completed.

| Property | Value |
|----------|-------|
| Unit | Count |
| Range | 0 - type(uint256).max |

### lastUpdated (uint256)

Timestamp of the user's most recent transaction.

| Property | Value |
|----------|-------|
| Unit | Unix timestamp (seconds) |
| Range | 0 - type(uint256).max |

Returns 0 if user has no transactions.

## Access Control

None. View function callable by anyone.

## Events Emitted

None. View functions do not emit events.

## Errors

None. View function returns zeroes for unknown users.

## Invariants

1. totalReceived never exceeds any active rule's cumulativeLimit
2. transactionCount accurately reflects processed transactions
3. lastUpdated is never in the future

## On-Chain Responsibility

Single storage read to return user's usage struct.

## Off-Chain Responsibility

Frontend application:
- Query to display user's cashback history
- Calculate remaining eligibility
- Show progress toward limit

## Gas Considerations

| Operation | Approximate Cost |
|-----------|------------------|
| View function call | 0 gas (eth_call) |
| Internal gas consumption | ~2,100 gas |

## Usage Context

This function enables:
- Progress display ("You've received X of Y available cashback")
- Eligibility checking
- Transaction history summary

## Implementation Notes

Returns the entire Usage struct for the given address. For addresses with no transactions, all fields return 0.

---

# Function Detail: Withdraw Funds

## Function Signature

```solidity
function withdrawFunds(
    uint256 amount
) external
```

## Description

Allows the admin to withdraw ETH from the contract. Used to retrieve unallocated funds or in emergency situations.

## Parameters

### amount (uint256)

The amount of ETH to withdraw in wei.

| Property | Value |
|----------|-------|
| Unit | Wei |
| Range | 1 - address(this).balance |
| Validation | Must not exceed contract balance |

## Return Value

None.

## Access Control

Restricted to admin only via `onlyAdmin` modifier.

## Events Emitted

```solidity
event FundsWithdrawn(address indexed admin, uint256 amount);
```

## Errors

| Error | Condition |
|-------|-----------|
| `Unauthorized()` | Caller is not admin |
| `ZeroAmount()` | Amount is 0 |
| `InsufficientFunds()` | Contract balance < amount |
| `TransferFailed()` | ETH transfer reverted |

## State Modifications

Contract balance reduced by amount.

## Invariants

1. Only admin can withdraw
2. Withdrawal cannot exceed current balance
3. Transfer must succeed or entire transaction reverts

## Security Considerations

No reentrancy risk as admin is trusted and this is final action.

---

# Function Detail: Pause

## Function Signature

```solidity
function pause() external
```

## Description

Pauses the contract, preventing processTransaction calls. Used for emergency situations.

## Parameters

None.

## Return Value

None.

## Access Control

Restricted to admin only.

## Events Emitted

```solidity
event Paused(address indexed admin);
```

## Errors

| Error | Condition |
|-------|-----------|
| `Unauthorized()` | Caller is not admin |
| `AlreadyPaused()` | Contract already paused |

---

# Function Detail: Unpause

## Function Signature

```solidity
function unpause() external
```

## Description

Unpauses the contract, resuming normal operations.

## Parameters

None.

## Return Value

None.

## Access Control

Restricted to admin only.

## Events Emitted

```solidity
event Unpaused(address indexed admin);
```

## Errors

| Error | Condition |
|-------|-----------|
| `Unauthorized()` | Caller is not admin |
| `NotPaused()` | Contract not currently paused |
