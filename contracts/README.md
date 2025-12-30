# 📜 ETH Cash Back - Smart Contracts

Solidity smart contracts for the ETH Cash Back infrastructure.

---

## 🔗 Deployed Contract

| Property | Value |
|----------|-------|
| **Network** | Ethereum Sepolia (Chain ID: 11155111) |
| **Address** | [`0x63b4889Ddf3e7889f39dAe1Cbd467D824b340cea`](https://sepolia.etherscan.io/address/0x63b4889Ddf3e7889f39dAe1Cbd467D824b340cea#code) |
| **Admin** | `0xC289b3c8f161006a180fD892348d8895ebF91214` |
| **Active Rule ID** | `0xe16b6427c2c18a12b5c1b0d016860ab0caad2ba3749a30e220c1adea8667fe3a` |

---

## 📦 Contracts

### CashbackManager.sol

The core contract managing ETH cashback distribution.

**Features:**
- ✅ Rule-based cashback configuration
- ✅ Per-user usage tracking & limits
- ✅ CEI pattern for security
- ✅ ReentrancyGuard protection
- ✅ Pausable emergency controls
- ✅ Custom errors (gas-efficient)

---

## 🛠️ Functions

### Admin Functions (onlyAdmin)

| Function | Description |
|----------|-------------|
| `registerRule(percentage, cap, cumulativeLimit, validityWindow)` | Register new cashback rule |
| `withdrawFunds(amount)` | Withdraw ETH from contract |
| `pause()` / `unpause()` | Emergency controls |
| `transferAdmin(newAdmin)` | Transfer admin role |

### User Functions

| Function | Description |
|----------|-------------|
| `processTransaction(ruleId)` | Process transaction & receive cashback (payable) |

### View Functions

| Function | Description |
|----------|-------------|
| `calculateCashback(ruleId, user, amount)` | Preview cashback amount |
| `getUserUsage(user)` | Get user's cashback statistics |
| `getRule(ruleId)` | Get rule details |
| `paused()` | Check if contract is paused |

---

## ⚙️ Data Structures

### Rule
```solidity
struct Rule {
    uint256 percentage;      // Basis points (100 = 1%, max 1000 = 10%)
    uint256 cap;             // Max cashback per transaction (wei)
    uint256 cumulativeLimit; // Max total per user (wei)
    uint256 validFrom;       // Activation timestamp
    uint256 validUntil;      // Expiration timestamp
    bool active;
}
```

### Usage
```solidity
struct Usage {
    uint256 totalReceived;    // Cumulative cashback (wei)
    uint256 transactionCount; // Number of transactions
    uint256 lastUpdated;      // Last transaction timestamp
}
```

---

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Compile

```bash
npx hardhat compile
```

### Test

```bash
npx hardhat test
```

### Coverage

```bash
npx hardhat coverage
```

### Deploy to Sepolia

```bash
cp .env.example .env
# Edit .env with your keys
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 📋 Environment Variables

Create `.env` file based on `.env.example`:

```env
# RPC URL (choose one)
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia

# Deployment wallet private key
PRIVATE_KEY=your_private_key

# For contract verification
ETHERSCAN_API_KEY=your_etherscan_key
```

---

## 🧪 Test Coverage

```
-----------------------|----------|----------|----------|----------|
File                   |  % Stmts | % Branch |  % Funcs |  % Lines |
-----------------------|----------|----------|----------|----------|
CashbackManager.sol    |    98.08 |    89.39 |      100 |    98.33 |
-----------------------|----------|----------|----------|----------|
```

**59 tests passing** covering:
- Rule registration & validation
- Transaction processing & cashback
- Limit enforcement
- Admin controls
- Security scenarios

---

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **CEI Pattern**: Checks-Effects-Interactions
- **Custom Errors**: Gas-efficient error handling
- **Access Control**: Admin-only modifiers
- **Pausable**: Emergency stop mechanism
- **Input Validation**: All parameters validated

---

## 📁 Project Structure

```
contracts/
├── contracts/
│   ├── CashbackManager.sol      # Main contract
│   └── interfaces/
│       └── ICashbackManager.sol # Interface
├── scripts/
│   └── deploy.ts                # Deployment script
├── test/
│   └── CashbackManager.test.ts  # Test suite
├── hardhat.config.ts            # Hardhat config
├── .env.example                 # Environment template
└── README.md                    # This file
```

---

## 📖 Usage Example

### Register a Rule (Admin)

```javascript
// 2% cashback, 0.1 ETH cap, 0.5 ETH user limit, 30 days validity
const tx = await cashbackManager.registerRule(
    200,                              // 2% in basis points
    ethers.parseEther("0.1"),         // cap
    ethers.parseEther("0.5"),         // cumulative limit
    30 * 24 * 60 * 60                 // 30 days in seconds
);
```

### Process Transaction (User)

```javascript
// Send 1 ETH, receive 2% = 0.02 ETH cashback
await cashbackManager.processTransaction(ruleId, {
    value: ethers.parseEther("1")
});
```

### Preview Cashback (View)

```javascript
const cashback = await cashbackManager.calculateCashback(
    ruleId,
    userAddress,
    ethers.parseEther("1")
);
// Returns: 20000000000000000 (0.02 ETH in wei)
```

---

## 📄 License

MIT

---

## 👥 Team

| Role | Name |
|------|------|
| **Project Owner, Full Stack Developer** | Bernie |
| **Development Supporter** | Canh |

### 📬 Contact

| Channel | Link |
|---------|------|
| **Email** | bernie.web3@gmail.com |
| **Telegram (HackOn Team Vietnam)** | https://t.me/hackonteam |
| **Telegram (Project Owner)** | https://t.me/bernieio |

