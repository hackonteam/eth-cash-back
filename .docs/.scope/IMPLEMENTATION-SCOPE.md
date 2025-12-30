# ETH Cash Back - Implementation Scope

## Project Identity

**Project Name**: ETH Cash Back  
**Description**: Cashback and Gas Sponsorship Infrastructure for Web3  
**Target Network**: Ethereum Sepolia (Chain ID: 11155111)  
**Contract Framework**: Hardhat v2  
**Frontend Framework**: Lovable  
**Version**: MVP

## MVP Definition

This document defines the boundaries of the MVP implementation. Features listed under "In Scope" are implementation targets. Features listed under "Out of Scope" are explicitly excluded from this phase.

## In Scope

### Smart Contract Capabilities

#### Cashback Rule Registration

**Purpose**: Enable administrators to configure cashback parameters for dApp integrations.

**Parameters**:
- `percentage`: Cashback percentage in basis points (1-1000, where 100 = 1%)
- `cap`: Maximum cashback amount per transaction in wei
- `validityWindow`: Duration in seconds for which the rule remains active

**Constraints**:
- Only admin can register rules
- Percentage cannot exceed 10% (1000 basis points)
- Cap must be greater than zero
- Validity window must be greater than zero

#### Per-User Usage Tracking

**Purpose**: Track cashback utilization per user address to enforce limits.

**Tracked Data**:
- Total cashback received (cumulative)
- Number of transactions with cashback
- Last transaction timestamp

**Storage Pattern**:
- Mapping from user address to usage struct
- Reset mechanism tied to validity window

#### ETH Cashback Calculation

**Purpose**: Compute cashback amount based on transaction value and active rule.

**Calculation**:
```
cashback = (transactionValue * percentage) / 10000
if (cashback > cap) {
    cashback = cap
}
if (cashback > remainingLimit) {
    cashback = remainingLimit
}
```

**Constraints**:
- Calculation must not overflow
- Zero cashback for transactions outside validity window
- Zero cashback when user limit exhausted

#### ETH Cashback Distribution

**Purpose**: Transfer calculated cashback to user address.

**Mechanism**:
- Direct ETH transfer from contract to user
- Transfer occurs after successful transaction recording
- Follows CEI pattern

**Requirements**:
- Contract must hold sufficient ETH balance
- Failed transfers must revert entire transaction
- Event emission on successful distribution

#### Hard Usage Limits Enforcement

**Purpose**: Prevent abuse by limiting cashback per user within a time window.

**Limit Types**:
- Per-transaction cap (from rule)
- Cumulative cap per user per validity window

**Enforcement**:
- Check limit before processing cashback
- Update usage after distribution
- Return zero or reduced cashback when limit approached

#### Admin-Only Configuration

**Purpose**: Restrict sensitive operations to authorized addresses.

**Admin Capabilities**:
- Register new cashback rules
- Pause/unpause contract
- Withdraw unallocated funds
- Update admin address

**Access Control**:
- Single admin address (set at deployment)
- Modifier-based access control
- Not upgradeable

### Frontend Capabilities

#### Wallet Connection

- Connect/disconnect wallet
- Display connected address
- Network detection and switching
- Support for MetaMask and WalletConnect

#### Transaction Interface

- Input transaction amount
- Display calculated cashback preview
- Submit transaction
- Show transaction status

#### Status Display

- Current transaction state
- Cashback received confirmation
- Error messages
- Transaction hash with explorer link

## Out of Scope

The following features are explicitly excluded from the MVP:

### ERC-4337 Paymaster

**Exclusion Reason**: Adds significant complexity for account abstraction. MVP focuses on direct EOA interactions.

### Gas Abstraction at Protocol Level

**Exclusion Reason**: True gasless transactions require Paymaster or relayer infrastructure. MVP simulates gas sponsorship conceptually through cashback.

### Multi-Chain Support

**Exclusion Reason**: MVP targets single network (Sepolia) to reduce deployment and testing complexity.

**Future Consideration**: Architecture does not preclude multi-chain but implementation deferred.

### SDKs

**Exclusion Reason**: SDK development requires stable API. MVP establishes core contract interface first.

### Analytics Dashboards

**Exclusion Reason**: Not essential for demonstrating core cashback functionality.

**Future Consideration**: Can be layered via subgraph indexing in production.

### Production Security Hardening

**Items Deferred**:
- Formal verification
- Multiple audit rounds
- Bug bounty program
- Multisig admin control
- Timelock on admin functions

**MVP Security**: Basic security patterns (CEI, access control, input validation) are implemented. Production deployment requires additional hardening.

## Network Configuration

### Ethereum Sepolia

| Property | Value |
|----------|-------|
| Network Name | Sepolia |
| Chain ID | 11155111 |
| Currency Symbol | ETH |
| Block Explorer | https://sepolia.etherscan.io |

### RPC Endpoints

Use one of the following:
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/{API_KEY}`
- Infura: `https://sepolia.infura.io/v3/{API_KEY}`
- Public: `https://rpc.sepolia.org`

### Faucets

Sepolia testnet ETH can be obtained from:
- Alchemy Faucet: https://sepoliafaucet.com/
- Infura Faucet: https://www.infura.io/faucet/sepolia

## Contract Design Decisions

### Non-Upgradeable

**Decision**: Contracts are not upgradeable.

**Rationale**:
- Reduces attack surface
- Simplifies deployment
- Appropriate for MVP demonstration
- Upgradeable patterns add complexity without MVP benefit

### Single Admin

**Decision**: Single EOA as admin address.

**Rationale**:
- Simplest access control model
- Sufficient for testnet demonstration
- Production would require multisig

### ETH-Only Cashback

**Decision**: Cashback is distributed in native ETH only.

**Rationale**:
- Simplifies token handling
- No ERC-20 approval flows required
- Direct value transfer to users

## Success Criteria

The MVP is considered successful when:

1. Admin can register a cashback rule on Sepolia
2. User can perform a transaction and receive ETH cashback
3. Usage limits are enforced correctly
4. Frontend displays transaction and cashback status
5. All public contract functions are tested
6. Documentation is complete and accurate
