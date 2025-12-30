# Function Pseudocode: Core Contract Functions

## Overview

This document provides pseudocode implementations for all CashbackManager contract functions. The pseudocode is implementation-ready and follows the patterns defined in CODE-STANDARDS.md.

---

## registerRule

```
FUNCTION registerRule(
    percentage: uint256,
    cap: uint256,
    cumulativeLimit: uint256,
    validityWindow: uint256
) RETURNS bytes32

    // Access Control
    IF msg.sender != admin THEN
        REVERT Unauthorized()
    END IF
    
    // Pause Check
    IF paused THEN
        REVERT ContractPaused()
    END IF
    
    // Input Validation
    IF percentage == 0 OR percentage > 1000 THEN
        REVERT InvalidPercentage(percentage)
    END IF
    
    IF cap == 0 THEN
        REVERT ZeroAmount()
    END IF
    
    IF cumulativeLimit == 0 THEN
        REVERT ZeroAmount()
    END IF
    
    IF validityWindow == 0 THEN
        REVERT InvalidValidityWindow()
    END IF
    
    // Generate Rule ID
    ruleId = keccak256(
        abi.encode(
            percentage,
            cap,
            cumulativeLimit,
            validityWindow,
            block.timestamp
        )
    )
    
    // Calculate validity period
    validFrom = block.timestamp
    validUntil = block.timestamp + validityWindow
    
    // Store rule
    rules[ruleId] = Rule(
        percentage: percentage,
        cap: cap,
        cumulativeLimit: cumulativeLimit,
        validFrom: validFrom,
        validUntil: validUntil,
        active: true
    )
    
    // Emit event
    EMIT RuleRegistered(
        ruleId,
        percentage,
        cap,
        cumulativeLimit,
        validFrom,
        validUntil
    )
    
    RETURN ruleId

END FUNCTION
```

---

## processTransaction

```
FUNCTION processTransaction(ruleId: bytes32) PAYABLE

    // Reentrancy Guard
    IF _locked THEN
        REVERT ReentrantCall()
    END IF
    _locked = true
    
    // Pause Check
    IF paused THEN
        _locked = false
        REVERT ContractPaused()
    END IF
    
    // Load rule from storage
    rule = rules[ruleId]
    
    // CHECKS: Validate rule
    IF rule.validFrom == 0 THEN
        _locked = false
        REVERT RuleNotFound()
    END IF
    
    IF NOT rule.active THEN
        _locked = false
        REVERT RuleInactive()
    END IF
    
    IF block.timestamp > rule.validUntil THEN
        _locked = false
        REVERT RuleExpired()
    END IF
    
    // Load user usage
    usage = userUsage[msg.sender]
    
    // CHECKS: Validate user limit
    IF usage.totalReceived >= rule.cumulativeLimit THEN
        _locked = false
        REVERT LimitExceeded()
    END IF
    
    // Calculate cashback
    cashback = _calculateCashbackInternal(rule, usage, msg.value)
    
    // CHECKS: Validate contract balance
    IF address(this).balance < cashback THEN
        _locked = false
        REVERT InsufficientFunds()
    END IF
    
    // EFFECTS: Update user usage
    userUsage[msg.sender].totalReceived = usage.totalReceived + cashback
    userUsage[msg.sender].transactionCount = usage.transactionCount + 1
    userUsage[msg.sender].lastUpdated = block.timestamp
    
    // INTERACTIONS: Transfer cashback
    IF cashback > 0 THEN
        (success, ) = msg.sender.call{value: cashback}("")
        IF NOT success THEN
            REVERT TransferFailed()
        END IF
    END IF
    
    // Emit event
    EMIT CashbackDistributed(
        msg.sender,
        cashback,
        ruleId,
        msg.value
    )
    
    // Release reentrancy lock
    _locked = false

END FUNCTION
```

---

## _calculateCashbackInternal (Internal Function)

```
FUNCTION _calculateCashbackInternal(
    rule: Rule,
    usage: Usage,
    amount: uint256
) RETURNS uint256 INTERNAL VIEW

    // Step 1: Calculate raw cashback
    // amount * percentage / 10000
    rawCashback = (amount * rule.percentage) / 10000
    
    // Step 2: Apply per-transaction cap
    IF rawCashback > rule.cap THEN
        cappedCashback = rule.cap
    ELSE
        cappedCashback = rawCashback
    END IF
    
    // Step 3: Apply user cumulative limit
    remainingLimit = rule.cumulativeLimit - usage.totalReceived
    
    IF cappedCashback > remainingLimit THEN
        finalCashback = remainingLimit
    ELSE
        finalCashback = cappedCashback
    END IF
    
    RETURN finalCashback

END FUNCTION
```

---

## calculateCashback (External View)

```
FUNCTION calculateCashback(
    ruleId: bytes32,
    user: address,
    amount: uint256
) RETURNS uint256 EXTERNAL VIEW

    // Load rule
    rule = rules[ruleId]
    
    // Return 0 for invalid/expired rules (no revert)
    IF rule.validFrom == 0 THEN
        RETURN 0
    END IF
    
    IF NOT rule.active THEN
        RETURN 0
    END IF
    
    IF block.timestamp > rule.validUntil THEN
        RETURN 0
    END IF
    
    // Load user usage
    usage = userUsage[user]
    
    // Return 0 if limit exhausted
    IF usage.totalReceived >= rule.cumulativeLimit THEN
        RETURN 0
    END IF
    
    // Calculate and return
    RETURN _calculateCashbackInternal(rule, usage, amount)

END FUNCTION
```

---

## getUserUsage

```
FUNCTION getUserUsage(user: address) 
    RETURNS (uint256, uint256, uint256) EXTERNAL VIEW

    usage = userUsage[user]
    
    RETURN (
        usage.totalReceived,
        usage.transactionCount,
        usage.lastUpdated
    )

END FUNCTION
```

---

## withdrawFunds

```
FUNCTION withdrawFunds(amount: uint256) EXTERNAL

    // Access Control
    IF msg.sender != admin THEN
        REVERT Unauthorized()
    END IF
    
    // Validation
    IF amount == 0 THEN
        REVERT ZeroAmount()
    END IF
    
    IF address(this).balance < amount THEN
        REVERT InsufficientFunds()
    END IF
    
    // Transfer
    (success, ) = admin.call{value: amount}("")
    IF NOT success THEN
        REVERT TransferFailed()
    END IF
    
    // Event
    EMIT FundsWithdrawn(admin, amount)

END FUNCTION
```

---

## pause

```
FUNCTION pause() EXTERNAL

    // Access Control
    IF msg.sender != admin THEN
        REVERT Unauthorized()
    END IF
    
    // Validation
    IF paused THEN
        REVERT AlreadyPaused()
    END IF
    
    // Update state
    paused = true
    
    // Event
    EMIT Paused(admin)

END FUNCTION
```

---

## unpause

```
FUNCTION unpause() EXTERNAL

    // Access Control
    IF msg.sender != admin THEN
        REVERT Unauthorized()
    END IF
    
    // Validation
    IF NOT paused THEN
        REVERT NotPaused()
    END IF
    
    // Update state
    paused = false
    
    // Event
    EMIT Unpaused(admin)

END FUNCTION
```

---

## transferAdmin

```
FUNCTION transferAdmin(newAdmin: address) EXTERNAL

    // Access Control
    IF msg.sender != admin THEN
        REVERT Unauthorized()
    END IF
    
    // Validation
    IF newAdmin == address(0) THEN
        REVERT ZeroAddress()
    END IF
    
    // Store old admin for event
    oldAdmin = admin
    
    // Update state
    admin = newAdmin
    
    // Event
    EMIT AdminChanged(oldAdmin, newAdmin)

END FUNCTION
```

---

## receive (Fallback for ETH)

```
RECEIVE() EXTERNAL PAYABLE

    // Accept ETH deposits silently
    // No logic needed - just accept funds

END RECEIVE
```

---

## Constructor

```
CONSTRUCTOR()

    // Set deployer as admin
    admin = msg.sender
    
    // Initialize state
    paused = false
    _locked = false

END CONSTRUCTOR
```

---

## Data Structures

```
STRUCT Rule
    percentage: uint256        // Basis points (100 = 1%)
    cap: uint256               // Max cashback per transaction (wei)
    cumulativeLimit: uint256   // Max total cashback per user (wei)
    validFrom: uint256         // Activation timestamp
    validUntil: uint256        // Expiration timestamp
    active: bool               // Manual activation flag
END STRUCT

STRUCT Usage
    totalReceived: uint256     // Cumulative cashback (wei)
    transactionCount: uint256  // Number of transactions
    lastUpdated: uint256       // Last transaction timestamp
END STRUCT
```
