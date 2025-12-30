# 🚀 ETH Cash Back

**Cashback & Gas Sponsorship Infrastructure for Web3**

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-yellow)](https://hardhat.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network](https://img.shields.io/badge/Network-Sepolia-purple)](https://sepolia.etherscan.io/)

---

## 📋 Overview

ETH Cash Back is a **plug-and-play infrastructure layer** that allows dApps to:

- 💰 **Sponsor gas fees** for users
- 🔄 **Return 2-10% ETH cashback** per transaction
- 📊 **Apply usage limits** per user (configurable)
- ⚙️ **Configure cashback rules** without custom logic

> Transform gas fees from a cost into a reward experience.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              User Browser                    │
│         (Frontend - Lovable)                 │
└─────────────────┬───────────────────────────┘
                  │ wagmi/viem
                  ▼
┌─────────────────────────────────────────────┐
│         Ethereum Sepolia Network             │
│  ┌───────────────────────────────────────┐  │
│  │       CashbackManager Contract        │  │
│  │  • Rule Storage                       │  │
│  │  • Usage Tracking                     │  │
│  │  • Cashback Distribution              │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 📦 Project Structure

```
eth-cash-back/
├── .agent/           # AI agent configurations
├── .docs/            # Project documentation
│   ├── .foundation/  # Project vision & goals
│   ├── .project/     # Technical specifications
│   ├── .rules/       # Code standards
│   ├── .scope/       # MVP boundaries
│   └── .logs/        # Completion logs
├── contracts/        # Smart contracts (Hardhat)
└── README.md         # This file
```

---

## 🚀 Deployed Contract

| Property | Value |
|----------|-------|
| **Network** | Ethereum Sepolia |
| **Chain ID** | 11155111 |
| **Contract** | [`0x63b4889Ddf3e7889f39dAe1Cbd467D824b340cea`](https://sepolia.etherscan.io/address/0x63b4889Ddf3e7889f39dAe1Cbd467D824b340cea#code) |
| **Status** | ✅ Verified |

---

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.20
- **Hardhat** 2.x
- **OpenZeppelin** 5.x (ReentrancyGuard, Pausable)

### Frontend (Planned)
- **Lovable** Framework
- **wagmi** 2.x + **viem** 2.x
- **React** 18.x

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Foundation](/.docs/.foundation/foundation.md) | Project vision |
| [Implementation Scope](/.docs/.scope/IMPLEMENTATION-SCOPE.md) | MVP boundaries |
| [System Architecture](/.docs/.project/.project-and-system-architecture/SYSTEM-ARCHITECTURE.md) | Technical design |
| [Code Standards](/.docs/.rules/CODE-STANDARDS.md) | Coding guidelines |
| [Tech Stack](/.docs/.project/.tech-stack/TECH-STACK-MVP.md) | Technology choices |

---

## 🚀 Quick Start

### Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### Deploy to Sepolia

```bash
cp .env.example .env
# Configure your RPC URL and private key
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 🧪 Test Coverage

| Metric | Coverage |
|--------|----------|
| Statements | 98.08% |
| Branches | 89.39% |
| Functions | 100% |
| Lines | 98.33% |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

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

---

## 🔮 Roadmap

- [x] Smart Contract Development
- [x] Deploy to Sepolia Testnet
- [ ] Frontend Development (Lovable)
- [ ] Integration Testing
- [ ] Mainnet Deployment
