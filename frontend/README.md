# ETH Cash Back Frontend

A Web3 frontend application for **ETH Cash Back** - a cashback and gas sponsorship infrastructure on Ethereum Sepolia. This system allows dApps to provide ETH cashback to users based on configurable rules.

![ETH Cash Back](https://img.shields.io/badge/Network-Sepolia-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)
![wagmi](https://img.shields.io/badge/wagmi-2.x-black)

## 🚀 Features

- **Wallet Connection**: Seamless MetaMask and WalletConnect integration
- **Network Guard**: Auto-detect and prompt Sepolia network switch
- **Real-time Cashback Preview**: Calculate cashback before transaction
- **Transaction Processing**: Send ETH and receive cashback automatically
- **User Statistics**: Track total cashback received, transaction count, and activity
- **Responsive Design**: Mobile-first, works on all devices
- **Dark/Light Mode**: Full theme support

## 🛠️ Tech Stack

- **Framework**: React 18+ with TypeScript
- **Web3**: wagmi v2 + viem v2
- **State Management**: @tanstack/react-query v5
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite

## 📋 Smart Contract

| Property | Value |
|----------|-------|
| **Contract Address** | `0x63b4889Ddf3e7889f39dAe1Cbd467D824b340cea` |
| **Network** | Ethereum Sepolia (Chain ID: 11155111) |
| **Rule ID** | `0xe16b6427c2c18a12b5c1b0d016860ab0caad2ba3749a30e220c1adea8667fe3a` |
| **Etherscan** | [View Contract](https://sepolia.etherscan.io/address/0x63b4889Ddf3e7889f39dAe1Cbd467D824b340cea) |

## 🏃 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask or WalletConnect compatible wallet
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

No environment variables are required for basic functionality. The app uses public RPC endpoints.

## 📱 Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Switch Network**: If prompted, switch to Ethereum Sepolia testnet
3. **Enter Amount**: Input the ETH amount you want to transact
4. **Preview Cashback**: See real-time cashback calculation
5. **Submit Transaction**: Confirm in your wallet and receive cashback!

## 🏗️ Project Structure

```
src/
├── components/
│   ├── transaction/
│   │   ├── AmountInput.tsx      # ETH amount input with validation
│   │   ├── CashbackPreview.tsx  # Real-time cashback display
│   │   ├── TransactionForm.tsx  # Main transaction flow
│   │   ├── TransactionStatus.tsx # TX status indicator
│   │   └── UserStats.tsx        # User statistics display
│   ├── wallet/
│   │   ├── AddressDisplay.tsx   # Truncated address with copy
│   │   ├── NetworkIndicator.tsx # Network status badge
│   │   └── WalletConnector.tsx  # Wallet connection button
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── contracts.ts             # Contract ABI and config
│   ├── wagmi.ts                 # wagmi configuration
│   └── utils.ts                 # Utility functions
├── pages/
│   └── Index.tsx                # Main application page
└── index.css                    # Global styles & design tokens
```

## 🎨 Design System

The application follows a strict design system with:

- **Colors**: Web3-native palette with primary blue (#3B82F6) and purple accents
- **Typography**: Inter font family with mono for addresses/hashes
- **Components**: shadcn/ui based with custom Web3 variants
- **Animations**: Smooth transitions and loading states

## 🔐 Security

- Input validation for all user inputs
- Network verification before transactions
- Clear confirmation dialogs
- Etherscan links for transaction verification

## 👥 Team

### HackOn Team Vietnam

| Role | Name | Contact |
|------|------|---------|
| **Project Owner & Fullstack Developer** | Bernie | [@bernieio](https://t.me/bernieio) |
| **Development Supporter** | Canh | - |

### Contact

- 📧 **Email**: [bernie.web3@gmail.com](mailto:bernie.web3@gmail.com)
- 💬 **Team Telegram**: [https://t.me/hackonteam](https://t.me/hackonteam)
- 👤 **Project Owner Telegram**: [https://t.me/bernieio](https://t.me/bernieio)

## 📄 License

This project is open source and available under the [Apache License 2.0](LICENSE).

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Web3 integration powered by [wagmi](https://wagmi.sh) and [viem](https://viem.sh)

---

**Made with ❤️ by HackOn Team Vietnam**
