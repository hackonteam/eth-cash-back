# Function Detail: Calculate Cashback

## Function Signature

```solidity
function calculateCashback(
    bytes32 ruleId,
    address user,
    uint256 amount
) external view returns (uint256 cashback)
```

## Description

Computes the cashback amount for a given transaction without modifying state. This view function allows frontends to display cashback previews before transaction submission.

The calculation considers:
- Rule percentage and cap
- User's remaining limit
- Amount eligibility

## Parameters

### ruleId (bytes32)

The unique identifier of the cashback rule to apply.

| Property | Value |
|----------|-------|
| Type | bytes32 |
| Validation | Must exist (returns 0 if not) |

### user (address)

The user address to calculate cashback for.

| Property | Value |
|----------|-------|
| Type | address |
| Validation | None (zero address returns 0) |

### amount (uint256)

The transaction amount in wei.

| Property | Value |
|----------|-------|
| Type | uint256 |
| Unit | Wei |
| Validation | None (zero returns 0) |

## Return Value

### cashback (uint256)

The calculated cashback amount in wei.

Returns 0 when:
- Rule does not exist
- Rule is expired
- User limit is exhausted
- Amount is zero

## Access Control

None. View function callable by anyone.

## Events Emitted

None. View functions do not emit events.

## Errors

None. View function returns 0 instead of reverting for invalid inputs.

This design allows safe preview queries without transaction failures.

## Calculation Formula

```
Step 1: Base calculation
rawCashback = amount * percentage / 10000

Step 2: Apply per-transaction cap
cappedCashback = min(rawCashback, rule.cap)

Step 3: Apply user limit
remainingLimit = cumulativeLimit - userUsage[user].totalReceived
finalCashback = min(cappedCashback, remainingLimit)
```

## Invariants

1. Return value never exceeds amount (cashback <= 100%)
2. Return value never exceeds rule.cap
3. Return value never causes user to exceed cumulativeLimit
4. Return value is 0 for invalid/expired rules
5. Function never reverts (returns 0 for all error cases)

## On-Chain Responsibility

All calculation is on-chain:
- Read rule from storage
- Read user usage from storage
- Apply calculation formula
- Return result

No state modification occurs.

## Off-Chain Responsibility

Frontend application:
- Call before transaction submission
- Display preview to user
- Handle 0 return gracefully

## Gas Considerations

| Operation | Approximate Cost |
|-----------|------------------|
| View function call | 0 gas (eth_call) |
| Internal gas consumption | ~4,000 gas |

View functions consume no user gas when called via eth_call.

## Example Calculations

### Scenario 1: Normal Calculation

```
percentage = 200 (2%)
cap = 0.1 ETH
cumulativeLimit = 0.5 ETH
userTotalReceived = 0.1 ETH
amount = 1 ETH

rawCashback = 1 * 200 / 10000 = 0.02 ETH
cappedCashback = min(0.02, 0.1) = 0.02 ETH
remaining = 0.5 - 0.1 = 0.4 ETH
finalCashback = min(0.02, 0.4) = 0.02 ETH
```

### Scenario 2: Hit Per-Transaction Cap

```
percentage = 500 (5%)
cap = 0.05 ETH
amount = 2 ETH

rawCashback = 2 * 500 / 10000 = 0.1 ETH
cappedCashback = min(0.1, 0.05) = 0.05 ETH
```

### Scenario 3: Hit Cumulative Limit

```
percentage = 200 (2%)
cap = 0.1 ETH
cumulativeLimit = 0.5 ETH
userTotalReceived = 0.48 ETH
amount = 5 ETH

rawCashback = 5 * 200 / 10000 = 0.1 ETH
cappedCashback = min(0.1, 0.1) = 0.1 ETH
remaining = 0.5 - 0.48 = 0.02 ETH
finalCashback = min(0.1, 0.02) = 0.02 ETH
```

### Scenario 4: Limit Exhausted

```
cumulativeLimit = 0.5 ETH
userTotalReceived = 0.5 ETH
remaining = 0

finalCashback = 0
```

### Scenario 5: Rule Expired

```
rule.validUntil = 1704067200 (past timestamp)
block.timestamp = 1704153600 (now)

return 0 (rule expired)
```

## Usage Context

This function serves two purposes:

1. **Preview**: Allow users to see expected cashback before submitting
2. **Validation**: Verify rule is active and user has remaining limit

Frontends should call this function when:
- User enters transaction amount
- Before enabling submit button
- To update UI in real-time

## Implementation Notes

The function should perform the same calculation as processTransaction but without state modification. This ensures preview accuracy.

Differences from processTransaction:
- No revert on errors (returns 0)
- No state modification
- No event emission
- No ETH transfer
