# Function Detail: Register Cashback Rule

## Function Signature

```solidity
function registerRule(
    uint256 percentage,
    uint256 cap,
    uint256 cumulativeLimit,
    uint256 validityWindow
) external returns (bytes32 ruleId)
```

## Description

Registers a new cashback rule that defines the parameters for cashback distribution. Only the contract admin can invoke this function.

A rule determines:
- What percentage of a transaction value is returned as cashback
- The maximum cashback per individual transaction
- The maximum cumulative cashback a single user can receive
- How long the rule remains active

## Parameters

### percentage (uint256)

The cashback percentage in basis points.

| Property | Value |
|----------|-------|
| Unit | Basis points |
| Range | 1 - 1000 |
| Example | 200 = 2% |
| Validation | Must be > 0 and <= 1000 |

Basis points are used to avoid floating-point arithmetic. 100 basis points = 1%.

### cap (uint256)

Maximum cashback amount per transaction in wei.

| Property | Value |
|----------|-------|
| Unit | Wei |
| Range | 1 - type(uint256).max |
| Example | 1e17 = 0.1 ETH |
| Validation | Must be > 0 |

This prevents excessive cashback on large transactions.

### cumulativeLimit (uint256)

Maximum total cashback a single user can receive under this rule.

| Property | Value |
|----------|-------|
| Unit | Wei |
| Range | 1 - type(uint256).max |
| Example | 5e17 = 0.5 ETH |
| Validation | Must be > 0 |

Once a user reaches this limit, they receive no further cashback.

### validityWindow (uint256)

Duration in seconds for which this rule remains active after registration.

| Property | Value |
|----------|-------|
| Unit | Seconds |
| Range | 1 - type(uint256).max |
| Example | 2592000 = 30 days |
| Validation | Must be > 0 |

The rule expires at `block.timestamp + validityWindow`.

## Return Value

### ruleId (bytes32)

Unique identifier for the registered rule.

Computed as:
```
keccak256(abi.encode(percentage, cap, cumulativeLimit, validityWindow, block.timestamp))
```

This ID is used to reference the rule in subsequent operations.

## Access Control

Restricted to admin only via `onlyAdmin` modifier.

## Events Emitted

```solidity
event RuleRegistered(
    bytes32 indexed ruleId,
    uint256 percentage,
    uint256 cap,
    uint256 cumulativeLimit,
    uint256 validFrom,
    uint256 validUntil
);
```

## Errors

| Error | Condition |
|-------|-----------|
| `Unauthorized()` | Caller is not admin |
| `InvalidPercentage(uint256)` | Percentage is 0 or > 1000 |
| `ZeroAmount()` | Cap or cumulative limit is 0 |
| `InvalidValidityWindow()` | Validity window is 0 |
| `ContractPaused()` | Contract is in paused state |

## Invariants

1. Rule ID is unique (timestamp component ensures this)
2. `validFrom` equals `block.timestamp` at registration
3. `validUntil` equals `validFrom + validityWindow`
4. Rule is immediately active after registration
5. Rule cannot be modified after registration
6. Rule cannot be deleted (only expires)

## On-Chain Responsibility

All operations are on-chain:
- Parameter validation
- Rule ID generation
- Storage write
- Event emission

## Off-Chain Responsibility

Admin interface:
- Collect rule parameters via form
- Validate inputs before submission
- Store returned rule ID for reference
- Listen for RuleRegistered event

## Gas Considerations

| Operation | Approximate Cost |
|-----------|------------------|
| Storage write (new rule) | ~60,000 gas |
| Event emission | ~2,000 gas |
| Total | ~65,000 gas |

First rule registration is more expensive due to storage slot initialization.

## Usage Example

Registering a rule for 2% cashback with 0.1 ETH cap:

```
percentage: 200 (2%)
cap: 100000000000000000 (0.1 ETH in wei)
cumulativeLimit: 500000000000000000 (0.5 ETH in wei)
validityWindow: 2592000 (30 days in seconds)
```
