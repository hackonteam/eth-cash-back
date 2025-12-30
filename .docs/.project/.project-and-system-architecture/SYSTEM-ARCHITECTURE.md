# ETH Cash Back - System Architecture

## Overview

ETH Cash Back is a cashback infrastructure layer for Web3 dApps. The system enables dApps to provide ETH cashback to users on transactions, with configurable rules and usage limits.

This document describes the system architecture for the MVP implementation targeting Ethereum Sepolia.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Lovable Frontend                          │  │
│  │  - Wallet Connection                                       │  │
│  │  - Transaction Interface                                   │  │
│  │  - Status Display                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ Web3 (wagmi/viem)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Ethereum Sepolia Network                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │               CashbackManager Contract                     │  │
│  │  - Rule Storage                                            │  │
│  │  - Usage Tracking                                          │  │
│  │  - Cashback Distribution                                   │  │
│  │  - Access Control                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### On-Chain Components

#### CashbackManager Contract

The core smart contract handling all cashback logic.

**Responsibilities**:
- Store cashback rules
- Track per-user usage
- Calculate cashback amounts
- Distribute ETH to users
- Enforce limits
- Manage admin access

**State Variables**:

| Variable | Type | Purpose |
|----------|------|---------|
| `admin` | `address` | Admin address for privileged operations |
| `rules` | `mapping(bytes32 => Rule)` | Cashback rules indexed by rule ID |
| `userUsage` | `mapping(address => Usage)` | Per-user usage tracking |
| `paused` | `bool` | Emergency pause flag |

**Data Structures**:

```
Rule:
  - percentage: uint256 (basis points, 100 = 1%)
  - cap: uint256 (max cashback per transaction in wei)
  - cumulativeLimit: uint256 (max total cashback per user)
  - validFrom: uint256 (timestamp)
  - validUntil: uint256 (timestamp)
  - active: bool

Usage:
  - totalReceived: uint256 (cumulative cashback received)
  - transactionCount: uint256 (number of transactions)
  - lastUpdated: uint256 (timestamp of last transaction)
```

### Off-Chain Components

#### Frontend Application

Built with Lovable framework.

**Components**:
- WalletConnector: Handles wallet connection/disconnection
- TransactionForm: Input interface for transaction amounts
- CashbackPreview: Displays calculated cashback before submission
- TransactionStatus: Shows current transaction state
- StatusHistory: Lists recent transactions

**State Management**:
- Wallet connection state
- Current transaction state
- Pending transactions
- Error state

#### External Dependencies

| Dependency | Purpose |
|------------|---------|
| RPC Provider | Blockchain interaction (Alchemy/Infura) |
| Block Explorer | Transaction verification links |
| Wallet Provider | User authentication (MetaMask/WalletConnect) |

## Contract Structure

### Single Contract Design

The MVP uses a single contract design for simplicity:

```
CashbackManager.sol
├── State Variables
│   ├── admin
│   ├── rules[]
│   ├── userUsage[]
│   └── paused
├── Events
│   ├── RuleRegistered
│   ├── CashbackDistributed
│   ├── AdminChanged
│   └── Paused/Unpaused
├── Errors
│   ├── Unauthorized
│   ├── InvalidRule
│   ├── InsufficientFunds
│   ├── LimitExceeded
│   └── ContractPaused
├── Modifiers
│   ├── onlyAdmin
│   └── whenNotPaused
└── Functions
    ├── registerRule (admin)
    ├── processTransaction (external)
    ├── withdrawFunds (admin)
    ├── pause/unpause (admin)
    ├── calculateCashback (view)
    └── getUserUsage (view)
```

### Interface Design

```solidity
interface ICashbackManager {
    function registerRule(
        uint256 percentage,
        uint256 cap,
        uint256 cumulativeLimit,
        uint256 validityWindow
    ) external returns (bytes32 ruleId);
    
    function processTransaction(
        bytes32 ruleId
    ) external payable;
    
    function calculateCashback(
        bytes32 ruleId,
        address user,
        uint256 amount
    ) external view returns (uint256);
    
    function getUserUsage(
        address user
    ) external view returns (uint256 totalReceived, uint256 transactionCount);
}
```

## Data Flow

### Rule Registration Flow

```
Admin → registerRule(percentage, cap, limit, window)
         │
         ▼
    [Validate Inputs]
         │
         ▼
    [Generate Rule ID]
         │
         ▼
    [Store Rule]
         │
         ▼
    [Emit RuleRegistered]
         │
         ▼
    Return ruleId
```

### Transaction Processing Flow

```
User → processTransaction(ruleId) + ETH value
         │
         ▼
    [Validate Rule Active]
         │
         ▼
    [Validate User Limit]
         │
         ▼
    [Calculate Cashback]
         │
         ▼
    [Update User Usage]
         │
         ▼
    [Transfer Cashback]
         │
         ▼
    [Emit CashbackDistributed]
```

## Security Model

### Access Control Hierarchy

```
Admin (EOA)
    │
    ├── registerRule
    ├── pause/unpause
    ├── withdrawFunds
    └── transferAdmin
    
Users (Any EOA)
    │
    └── processTransaction
```

### Threat Model

| Threat | Mitigation |
|--------|------------|
| Reentrancy | CEI pattern, ReentrancyGuard |
| Admin key compromise | Pause mechanism, limited scope |
| Fund drainage | Balance checks, per-transaction caps |
| Usage manipulation | Per-user tracking, on-chain storage |
| Rule exploitation | Validity windows, cumulative limits |

### Trust Assumptions

1. Admin acts honestly (single EOA, testnet MVP)
2. RPC provider returns correct state
3. User wallet signs correct transactions

## Scalability Considerations

### MVP Limitations

- Single contract handles all rules
- Linear storage growth with users
- No batching of cashback distributions

### Future Improvements (Not MVP)

- Rule registry as separate contract
- Merkle proof-based claiming
- Batch processing for gas efficiency

## Integration Points

### External Integrations

**Frontend to Contract**:
- Read: `calculateCashback`, `getUserUsage`, rule data
- Write: `processTransaction`

**Contract to User**:
- ETH transfers via low-level call

**Frontend to Wallet**:
- Transaction signing via injected provider
- Network switching

### Event Monitoring

Events for frontend state updates:

| Event | Purpose |
|-------|---------|
| `RuleRegistered` | Update available rules list |
| `CashbackDistributed` | Confirm cashback receipt |
| `Paused` | Disable transaction form |

## Deployment Architecture

### Sepolia Deployment

```
Deployment Artifacts:
├── CashbackManager
│   ├── Address: [deployed address]
│   ├── ABI: contracts/CashbackManager.json
│   └── Verification: Etherscan verified
└── Configuration
    ├── Network: Sepolia (11155111)
    ├── Admin: [deployer address]
    └── Initial State: Unpaused, no rules
```

### Environment Configuration

| Variable | Usage |
|----------|-------|
| `SEPOLIA_RPC_URL` | Hardhat network configuration |
| `DEPLOYER_PRIVATE_KEY` | Contract deployment |
| `ETHERSCAN_API_KEY` | Contract verification |
