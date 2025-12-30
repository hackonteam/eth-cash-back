# ETH Cash Back - Tech Stack MVP

## Overview

This document specifies the complete technology stack for the ETH Cash Back MVP implementation targeting Ethereum Sepolia.

## Smart Contract Stack

### Development Framework

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Hardhat | 2.x | Compilation, testing, deployment |
| Language | Solidity | ^0.8.20 | Smart contract programming |
| Testing | Hardhat + Chai | Latest | Contract testing |
| Coverage | solidity-coverage | Latest | Code coverage |

### Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| OpenZeppelin Contracts | 5.x | Security primitives (ReentrancyGuard, Pausable) |

### Development Dependencies

```json
{
  "devDependencies": {
    "hardhat": "^2.19.0",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@openzeppelin/contracts": "^5.0.0",
    "dotenv": "^16.0.0"
  }
}
```

### Hardhat Plugins

| Plugin | Purpose |
|--------|---------|
| @nomicfoundation/hardhat-ethers | Ethers.js integration |
| @nomicfoundation/hardhat-chai-matchers | Testing utilities |
| hardhat-gas-reporter | Gas consumption analysis |
| solidity-coverage | Coverage reporting |
| @nomicfoundation/hardhat-verify | Etherscan verification |

## Frontend Stack

### Core Framework

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Lovable | Latest | Application framework |
| UI Library | React | 18.x | Component rendering |
| Language | TypeScript | 5.x | Type safety |
| Build Tool | Vite | 5.x | Development and bundling |

### Web3 Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| wagmi | 2.x | React hooks for Ethereum |
| viem | 2.x | TypeScript Ethereum library |
| @tanstack/react-query | 5.x | Data fetching (wagmi dependency) |

### Wallet Integration

| Library | Version | Purpose |
|---------|---------|---------|
| @rainbow-me/rainbowkit | 2.x (optional) | Wallet connection UI |
| @walletconnect/web3-provider | 2.x | WalletConnect support |

### Styling

| Technology | Purpose |
|------------|---------|
| CSS Variables | Design tokens |
| PostCSS | CSS processing |

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "wagmi": "^2.5.0",
    "viem": "^2.7.0",
    "@tanstack/react-query": "^5.17.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

## Infrastructure

### Network Configuration

| Property | Value |
|----------|-------|
| Network | Ethereum Sepolia |
| Chain ID | 11155111 |
| Currency | ETH |
| Block Time | ~12 seconds |

### RPC Providers

| Provider | Type | Usage |
|----------|------|-------|
| Alchemy | Primary | Production RPC |
| Infura | Fallback | Backup RPC |
| Public RPC | Development | Local testing |

### Block Explorer

| Explorer | URL |
|----------|-----|
| Etherscan Sepolia | https://sepolia.etherscan.io |

## Development Tools

### Local Development

| Tool | Purpose |
|------|---------|
| Node.js 18+ | Runtime |
| npm/pnpm | Package management |
| VS Code | IDE |
| Hardhat Network | Local testing |

### Testing

| Tool | Purpose |
|------|---------|
| Hardhat Test | Contract unit tests |
| Chai | Assertion library |
| Vitest | Frontend unit tests |
| Playwright (optional) | E2E testing |

### Code Quality

| Tool | Purpose |
|------|---------|
| ESLint | JavaScript/TypeScript linting |
| Prettier | Code formatting |
| Solhint | Solidity linting |
| TypeScript | Type checking |

## Version Requirements

### Minimum Versions

| Dependency | Minimum Version |
|------------|-----------------|
| Node.js | 18.0.0 |
| npm | 9.0.0 |
| Solidity | 0.8.20 |

### Recommended Versions

| Dependency | Recommended |
|------------|-------------|
| Node.js | 20.x LTS |
| npm | 10.x |

## Security Considerations

### Smart Contracts

- No external dependencies beyond OpenZeppelin
- OpenZeppelin 5.x for latest security patches
- Hardhat for consistent tooling

### Frontend

- No private key handling
- Environment variables for configuration
- Build-time secret injection only

## Excluded Technologies (MVP)

The following are explicitly NOT part of MVP:

| Technology | Reason for Exclusion |
|------------|---------------------|
| ERC-4337 SDK | Out of scope |
| The Graph | No indexing needed for MVP |
| IPFS | No decentralized storage needed |
| Foundry | Hardhat selected for consistency |
| Next.js | Lovable/Vite sufficient |
| Redux/Zustand | wagmi handles state |

## Upgrade Path

For production (post-MVP), consider:

| Current | Production Upgrade |
|---------|-------------------|
| Single admin EOA | Multisig (Gnosis Safe) |
| No analytics | The Graph subgraph |
| Manual deployment | CI/CD pipeline |
| Sepolia | Ethereum Mainnet |
