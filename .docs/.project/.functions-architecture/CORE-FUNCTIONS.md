# Function Architecture: Core Contract Functions

## Overview

This document describes the architectural design of the CashbackManager contract functions, including their internal structure, dependencies, and interaction patterns.

## Function Responsibility Matrix

| Function | State Write | ETH Flow | Event | Access Control |
|----------|------------|----------|-------|----------------|
| registerRule | Yes | No | Yes | Admin only |
| processTransaction | Yes | Out (to user) | Yes | None |
| calculateCashback | No | No | No | None |
| getUserUsage | No | No | No | None |
| withdrawFunds | No | Out (to admin) | Yes | Admin only |
| pause | Yes | No | Yes | Admin only |
| unpause | Yes | No | Yes | Admin only |
| receive | No | In | No | None |

## registerRule Architecture

### Purpose
Store cashback configuration parameters for dApp integrations.

### Internal Dependencies
- admin state variable (access control check)
- paused state variable (pause check)
- rules mapping (storage target)

### Call Graph

```
registerRule(percentage, cap, limit, window)
    │
    ├── [Modifier] onlyAdmin()
    │       └── Check msg.sender == admin
    │
    ├── [Modifier] whenNotPaused()
    │       └── Check paused == false
    │
    ├── [Validation]
    │       ├── validatePercentage(percentage)
    │       ├── validateAmount(cap)
    │       ├── validateAmount(limit)
    │       └── validateWindow(window)
    │
    ├── [ID Generation]
    │       └── generateRuleId(params, timestamp)
    │
    ├── [Storage]
    │       └── rules[ruleId] = Rule{...}
    │
    └── [Event]
            └── emit RuleRegistered(...)
```

### Storage Layout

```
rules[bytes32 ruleId] => Rule {
    uint256 percentage      // slot 0
    uint256 cap             // slot 1
    uint256 cumulativeLimit // slot 2
    uint256 validFrom       // slot 3
    uint256 validUntil      // slot 4
    bool active             // slot 5 (packed)
}
```

## processTransaction Architecture

### Purpose
Execute cashback distribution following CEI pattern.

### Internal Dependencies
- rules mapping (read rule parameters)
- userUsage mapping (read/write usage)
- Contract ETH balance (cashback source)

### Call Graph

```
processTransaction(ruleId) + msg.value
    │
    ├── [Modifier] whenNotPaused()
    │
    ├── [Modifier] nonReentrant()
    │
    ├── [CHECKS Phase]
    │       ├── loadRule(ruleId)
    │       ├── validateRuleActive(rule)
    │       ├── validateRuleNotExpired(rule)
    │       └── loadUserUsage(msg.sender)
    │
    ├── [Calculation]
    │       └── _calculateCashback(rule, usage, msg.value)
    │               ├── applyPercentage()
    │               ├── applyCap()
    │               └── applyUserLimit()
    │
    ├── [EFFECTS Phase]
    │       ├── usage.totalReceived += cashback
    │       ├── usage.transactionCount++
    │       └── usage.lastUpdated = block.timestamp
    │
    ├── [INTERACTIONS Phase]
    │       └── _transferETH(msg.sender, cashback)
    │               └── (bool success,) = user.call{value: cashback}("")
    │
    └── [Event]
            └── emit CashbackDistributed(...)
```

### Reentrancy Protection

The function follows CEI (Checks-Effects-Interactions) pattern:

1. All validations occur before any state changes
2. User usage is updated before ETH transfer
3. External call (ETH transfer) is the final operation

ReentrancyGuard modifier provides additional protection.

### Gas Optimization

```
// Cache storage reads
Rule memory rule = rules[ruleId];
Usage storage usage = userUsage[msg.sender];

// Single storage write for usage update
// (Solidity compiler optimizes struct writes)
```

## calculateCashback Architecture

### Purpose
Read-only calculation for frontend preview.

### Internal Dependencies
- rules mapping (read)
- userUsage mapping (read)

### Call Graph

```
calculateCashback(ruleId, user, amount)
    │
    ├── [Load Data]
    │       ├── rule = rules[ruleId]
    │       └── usage = userUsage[user]
    │
    ├── [Validation] (returns 0 instead of revert)
    │       ├── if (!rule.active) return 0
    │       └── if (block.timestamp > rule.validUntil) return 0
    │
    └── [Calculation]
            └── _calculateCashback(rule, usage, amount)
```

### Design Decision: No Revert

This function returns 0 for all error cases rather than reverting because:
- Used for frontend preview, not critical path
- Frontend can handle 0 gracefully
- Avoids transaction simulation failures
- Simplifies frontend error handling

## getUserUsage Architecture

### Purpose
Expose usage data for external queries.

### Call Graph

```
getUserUsage(user)
    │
    └── [Load & Return]
            └── return userUsage[user]
```

Minimal architecture - direct storage read and return.

## withdrawFunds Architecture

### Purpose
Allow admin to retrieve ETH from contract.

### Call Graph

```
withdrawFunds(amount)
    │
    ├── [Modifier] onlyAdmin()
    │
    ├── [Validation]
    │       └── require(address(this).balance >= amount)
    │
    ├── [Transfer]
    │       └── (bool success,) = admin.call{value: amount}("")
    │
    └── [Event]
            └── emit FundsWithdrawn(...)
```

## Modifier Architecture

### onlyAdmin

```
modifier onlyAdmin() {
    if (msg.sender != admin) revert Unauthorized();
    _;
}
```

Simple ownership check. Single admin pattern.

### whenNotPaused

```
modifier whenNotPaused() {
    if (paused) revert ContractPaused();
    _;
}
```

Gates all user-facing write functions.

### nonReentrant

```
modifier nonReentrant() {
    if (_locked) revert ReentrantCall();
    _locked = true;
    _;
    _locked = false;
}
```

Prevents reentrancy on processTransaction.

## Storage Architecture

### Slot Allocation

```
Slot 0: admin (address, 20 bytes)
Slot 1: paused (bool, 1 byte) + _locked (bool, 1 byte)
Slot 2: rules mapping base
Slot 3: userUsage mapping base
```

### Mapping Storage

Rules and usage are stored in mappings, with each entry occupying multiple slots based on struct size.

## Event Architecture

### Event Design Principles

1. Index searchable fields (ruleId, user address)
2. Include all relevant data (avoid requiring additional reads)
3. Emit after all state changes complete

### Events

```solidity
event RuleRegistered(
    bytes32 indexed ruleId,
    uint256 percentage,
    uint256 cap,
    uint256 cumulativeLimit,
    uint256 validFrom,
    uint256 validUntil
);

event CashbackDistributed(
    address indexed user,
    uint256 amount,
    bytes32 indexed ruleId,
    uint256 transactionValue
);

event FundsWithdrawn(address indexed admin, uint256 amount);
event Paused(address indexed admin);
event Unpaused(address indexed admin);
event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
```

## Error Architecture

Custom errors for gas efficiency:

```solidity
error Unauthorized();
error ContractPaused();
error RuleNotFound();
error RuleExpired();
error RuleInactive();
error LimitExceeded();
error InsufficientFunds();
error TransferFailed();
error ZeroAmount();
error InvalidPercentage(uint256 provided);
error InvalidValidityWindow();
```

Errors include parameters when useful for debugging.
