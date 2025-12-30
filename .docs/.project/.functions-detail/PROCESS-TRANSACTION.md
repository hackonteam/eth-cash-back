# Function Detail: Process Transaction

## Function Signature

```solidity
function processTransaction(
    bytes32 ruleId
) external payable
```

## Description

Processes a user transaction and distributes the calculated cashback to the sender. The function accepts ETH payment (the transaction value), validates eligibility, calculates cashback, updates usage tracking, and transfers cashback to the user.

This is the primary user-facing function for receiving cashback.

## Parameters

### ruleId (bytes32)

The unique identifier of the cashback rule to apply.

| Property | Value |
|----------|-------|
| Type | bytes32 |
| Source | Returned from registerRule |
| Validation | Must reference active, non-expired rule |

## Payable Value

### msg.value (uint256)

The ETH amount sent with the transaction.

| Property | Value |
|----------|-------|
| Unit | Wei |
| Range | 0 - type(uint256).max |
| Note | Cashback calculated on this value |

While zero value is technically valid, it results in zero cashback.

## Return Value

None. Success is indicated by transaction completion.

## Access Control

No access control. Any address can call this function.

## Events Emitted

```solidity
event CashbackDistributed(
    address indexed user,
    uint256 amount,
    bytes32 indexed ruleId,
    uint256 transactionValue
);
```

## Errors

| Error | Condition |
|-------|-----------|
| `RuleNotFound()` | Rule ID does not exist |
| `RuleExpired()` | Current timestamp > rule.validUntil |
| `RuleInactive()` | Rule has been deactivated |
| `LimitExceeded()` | User cumulative limit reached |
| `InsufficientFunds()` | Contract balance < cashback amount |
| `TransferFailed()` | ETH transfer to user reverted |
| `ContractPaused()` | Contract is in paused state |

## State Modifications

### Storage Writes

1. `userUsage[msg.sender].totalReceived += cashback`
2. `userUsage[msg.sender].transactionCount++`
3. `userUsage[msg.sender].lastUpdated = block.timestamp`

### ETH Transfer

```solidity
(bool success, ) = msg.sender.call{value: cashback}("");
```

## Invariants

1. Cashback never exceeds per-transaction cap
2. User cumulative cashback never exceeds rule.cumulativeLimit
3. Contract balance always sufficient for transfer (revert otherwise)
4. User usage is updated before ETH transfer (CEI pattern)
5. Transaction reverts entirely on any failure

## On-Chain Responsibility

| Operation | Location |
|-----------|----------|
| Rule validation | On-chain |
| Limit checking | On-chain |
| Cashback calculation | On-chain |
| Usage tracking | On-chain |
| ETH transfer | On-chain |
| Event emission | On-chain |

## Off-Chain Responsibility

Frontend application:
- Collect rule ID (usually hardcoded or from registry)
- Collect transaction amount from user
- Preview cashback via calculateCashback view
- Submit transaction
- Monitor transaction status
- Display result to user

## Gas Considerations

| Operation | Approximate Cost |
|-----------|------------------|
| Storage read (rule) | ~2,100 gas |
| Storage read (usage) | ~2,100 gas |
| Storage write (usage) | ~5,000 - 20,000 gas |
| ETH transfer | ~2,300 gas |
| Event emission | ~2,000 gas |
| Total (subsequent) | ~15,000 gas |
| Total (first usage) | ~45,000 gas |

First transaction for a user is more expensive due to storage initialization.

## Edge Cases

### Zero Transaction Value

```
msg.value = 0
cashback = 0 * percentage / 10000 = 0
Result: Transaction succeeds, no cashback, usage updated
```

### Limit Partially Remaining

```
cumulativeLimit = 0.5 ETH
totalReceived = 0.45 ETH
remaining = 0.05 ETH
calculated = 0.1 ETH
cashback = min(0.1, 0.05) = 0.05 ETH
```

### Limit Fully Exhausted

```
cumulativeLimit = 0.5 ETH
totalReceived = 0.5 ETH
remaining = 0
Result: Revert with LimitExceeded()
```

### Contract Underfunded

```
contract.balance = 0.01 ETH
cashback = 0.05 ETH
Result: Revert with InsufficientFunds()
```

## Security Considerations

1. Reentrancy protection via CEI pattern or ReentrancyGuard
2. Integer overflow protected by Solidity 0.8+
3. User cannot manipulate rule parameters
4. Transfer failures cause complete revert
5. No external calls before state updates
