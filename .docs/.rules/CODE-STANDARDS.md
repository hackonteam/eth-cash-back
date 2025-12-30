# ETH Cash Back - Code Standards

## Overview

This document defines the coding standards and engineering rules for the ETH Cash Back MVP. All smart contract development must adhere to these standards.

## Solidity Standards

### Compiler Version

```
pragma solidity ^0.8.20;
```

Minimum version 0.8.20 is required for:
- Built-in overflow/underflow protection
- Custom error support
- Improved gas optimization

### Contract Structure

Every contract must follow this ordering:

1. License identifier
2. Pragma statement
3. Imports
4. Interfaces
5. Libraries
6. Contracts

Within each contract:

1. Type declarations
2. State variables
3. Events
4. Errors
5. Modifiers
6. Constructor
7. External functions
8. Public functions
9. Internal functions
10. Private functions
11. View/Pure functions

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Contract | PascalCase | `CashbackManager` |
| Function | camelCase | `registerRule` |
| Variable | camelCase | `cashbackPercentage` |
| Constant | SCREAMING_SNAKE | `MAX_CASHBACK_PERCENTAGE` |
| Event | PascalCase | `CashbackDistributed` |
| Error | PascalCase | `InsufficientBalance` |
| Mapping | camelCase | `userUsage` |

### Error Handling

Custom errors are mandatory. Do not use require strings.

```solidity
// Required
error InsufficientBalance(uint256 requested, uint256 available);

if (balance < amount) {
    revert InsufficientBalance(amount, balance);
}

// Prohibited
require(balance >= amount, "Insufficient balance");
```

### CEI Pattern

All state-changing functions must follow Checks-Effects-Interactions:

1. **Checks**: Validate all conditions first
2. **Effects**: Update contract state
3. **Interactions**: External calls last

```solidity
function withdraw(uint256 amount) external {
    // Checks
    if (amount == 0) revert ZeroAmount();
    if (balances[msg.sender] < amount) revert InsufficientBalance(amount, balances[msg.sender]);
    
    // Effects
    balances[msg.sender] -= amount;
    
    // Interactions
    (bool success, ) = msg.sender.call{value: amount}("");
    if (!success) revert TransferFailed();
}
```

### Access Control

Admin functions must use explicit access control:

```solidity
error Unauthorized();

modifier onlyAdmin() {
    if (msg.sender != admin) revert Unauthorized();
    _;
}
```

### Input Validation

All external functions must validate inputs:

```solidity
error ZeroAddress();
error ZeroAmount();
error InvalidPercentage();

function setRule(address recipient, uint256 percentage) external {
    if (recipient == address(0)) revert ZeroAddress();
    if (percentage == 0 || percentage > 1000) revert InvalidPercentage();
    // ...
}
```

### Event Emission

State changes must emit events:

```solidity
event RuleRegistered(bytes32 indexed ruleId, uint256 percentage, uint256 cap, uint256 validUntil);
event CashbackDistributed(address indexed user, uint256 amount, bytes32 indexed ruleId);

function registerRule(...) external {
    // ... state changes
    emit RuleRegistered(ruleId, percentage, cap, validUntil);
}
```

## Hardhat v2 Standards

### Project Structure

```
contracts/
├── CashbackManager.sol
├── interfaces/
│   └── ICashbackManager.sol
├── libraries/
│   └── CashbackLib.sol
test/
├── CashbackManager.test.ts
scripts/
├── deploy.ts
hardhat.config.ts
```

### Testing Requirements

All contracts must have:
- Unit tests for every public/external function
- Edge case coverage
- Failure scenario tests
- Event emission verification

Test file naming: `{ContractName}.test.ts`

### Deployment Scripts

Scripts must:
- Log deployed addresses
- Verify on block explorer (when not localhost)
- Use environment variables for sensitive data

## Documentation Standards

### NatSpec Comments

All public functions require NatSpec:

```solidity
/// @notice Registers a new cashback rule
/// @param percentage Cashback percentage in basis points (100 = 1%)
/// @param cap Maximum cashback amount in wei
/// @param validityWindow Duration in seconds the rule remains active
/// @return ruleId Unique identifier for the registered rule
function registerRule(
    uint256 percentage,
    uint256 cap,
    uint256 validityWindow
) external returns (bytes32 ruleId);
```

### Inline Comments

Complex logic requires inline explanation:

```solidity
// Calculate cashback: (amount * percentage) / 10000
// Using basis points to avoid floating point
uint256 cashback = (amount * percentage) / 10000;

// Cap the cashback to maximum allowed
if (cashback > maxCashback) {
    cashback = maxCashback;
}
```

## Security Standards

### Prohibited Patterns

- Upgradeable proxy patterns
- delegatecall to untrusted contracts
- tx.origin for authentication
- Inline assembly without explicit justification
- External calls in loops

### Required Patterns

- ReentrancyGuard for functions with external calls and ETH transfers
- Pausable for emergency situations
- Bounds checking on all numeric inputs
- Explicit visibility on all functions and state variables

### Gas Considerations

- Avoid unbounded loops
- Pack storage variables
- Use calldata for read-only array parameters
- Cache storage reads in memory

## Testing Standards

### Test Structure

```typescript
describe("CashbackManager", () => {
    describe("registerRule", () => {
        it("should register a valid rule");
        it("should revert on zero percentage");
        it("should revert on percentage exceeding maximum");
        it("should emit RuleRegistered event");
    });
});
```

### Coverage Requirements

Minimum coverage thresholds:
- Statements: 90%
- Branches: 85%
- Functions: 90%
- Lines: 90%

## Network Configuration

Target Network: Ethereum Sepolia

```typescript
// hardhat.config.ts
networks: {
    sepolia: {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: [process.env.DEPLOYER_PRIVATE_KEY],
        chainId: 11155111
    }
}
```
