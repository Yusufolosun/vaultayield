# VaultaYield 🏦

> Bitcoin-native yield vault for STX stacking on Stacks blockchain

VaultaYield is a decentralized finance (DeFi) protocol that allows users to deposit STX tokens and automatically earn Bitcoin rewards through Stacks' native Proof of Transfer (PoX) stacking mechanism.

## 🎯 Overview

VaultaYield abstracts the complexity of STX stacking, allowing users to:
- **Deposit STX** and receive vault share tokens
- **Earn Bitcoin rewards** automatically through PoX stacking
- **Withdraw anytime** with proportional share of accumulated rewards
- **Track share value** in real-time

## 📊 Protocol Architecture

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │ Deposit STX / Withdraw
       ▼
┌─────────────────────┐         ┌──────────────────┐
│   vault-core.clar   │────────▶│ vault-token.clar │
│  (Main Contract)    │  Mint/  │  (SIP-010 Token) │
│                     │  Burn   │                  │
└──────┬──────────────┘         └──────────────────┘
       │ Fee Collection
       ▼
┌─────────────────────┐
│ fee-collector.clar  │
│  (Fee Management)   │
└─────────────────────┘
```

## 🔧 Smart Contracts

### 1. **vault-core.clar**
Main entry point for user interactions.

**Features:**
- Deposit STX and receive proportional vault shares
- Withdraw STX by burning vault shares
- Dynamic share pricing based on vault performance
- Withdrawal fee mechanism (0.5% default, 2% max)
- Emergency pause functionality
- Owner-only admin controls

### 2. **vault-token.clar**
SIP-010 compliant fungible token representing vault shares.

**Features:**
- Standard SIP-010 token interface
- Transferable vault shares (vySTX)
- Mint/burn authorization restricted to vault-core
- Token metadata and URI management

### 3. **fee-collector.clar**
Manages withdrawal fees and protocol revenue.

**Features:**
- Fee accumulation tracking
- Lifetime fee statistics
- Owner-only fee withdrawal
- Vault-core authorization system

## 🚀 Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v1.5.4+
- [Node.js](https://nodejs.org/) v16+
- Git

### Installation

```powershell
# Clone the repository
git clone https://github.com/Yusufolosun/vaultayield.git
cd vaultayield

# Verify Clarinet installation
clarinet --version
```

### Running Tests

```powershell
# Run all tests
clarinet test

# Run with coverage report
clarinet test --coverage

# Run specific test file
clarinet test --filter vault-core
```

### Local Development

```powershell
# Start Clarinet console for interactive testing
clarinet console

# Check contract syntax
clarinet check

# Generate contract documentation
clarinet contracts
```

## 💼 Usage Examples

### Depositing STX

```clarity
;; Deposit 10 STX (10,000,000 micro-STX)
(contract-call? .vault-core deposit u10000000)

;; Returns: (ok u10000000) - shares minted
```

### Checking Your Shares

```clarity
;; Get your vault share balance
(contract-call? .vault-core get-user-shares tx-sender)

;; Get your current STX value
(contract-call? .vault-core get-user-stx-value tx-sender)
```

### Withdrawing STX

```clarity
;; Withdraw 5,000,000 shares
(contract-call? .vault-core withdraw u5000000)

;; Returns: (ok u4975000) - STX returned after 0.5% fee
```

### Checking Share Price

```clarity
;; Get current share price (6 decimal precision)
(contract-call? .vault-core get-share-price)

;; Returns: u1000000 (1.000000 = 1:1 ratio)
```

## 🔐 Security Features

- **Access Control**: Owner-only functions for admin operations
- **Input Validation**: Zero amount and overflow protection
- **Emergency Pause**: Circuit breaker for critical situations
- **Fee Limits**: Maximum 2% withdrawal fee constraint
- **Authorization**: Contract-to-contract call restrictions

## 📈 Share Mechanics

### First Deposit
- **Ratio**: 1:1 (1 STX = 1 share)
- **Example**: Deposit 1,000,000 micro-STX → Receive 1,000,000 shares

### Subsequent Deposits
- **Formula**: `shares = (deposit × total_shares) / total_assets`
- **Example**: If share price is 1.1 STX, deposit 1,100,000 micro-STX → Receive 1,000,000 shares

### Withdrawals
- **Formula**: `stx_return = (shares × total_assets) / total_shares`
- **Fee Applied**: Net amount = STX return × (1 - fee_rate)
- **Example**: Withdraw 1,000,000 shares at 0.5% fee → Receive 995,000 micro-STX

## 💰 Fee Structure

| Fee Type | Default Rate | Maximum | Purpose |
|----------|--------------|---------|---------|
| Withdrawal Fee | 0.5% (50bp) | 2% (200bp) | Protocol revenue |
| Deposit Fee | 0% | - | No deposit fees |

## 🧪 Testing Coverage

| Contract | Test Cases | Coverage |
|----------|------------|----------|
| vault-core | 23 tests | Deposits, withdrawals, fees, pause, access control |
| vault-token | 18 tests | SIP-010 compliance, authorization, transfers |
| fee-collector | 16 tests | Fee tracking, withdrawal, authorization |
| **Total** | **57 tests** | **Comprehensive** |

## 📁 Project Structure

```
vaultayield/
├── contracts/
│   ├── vault-core.clar          # Main vault contract
│   ├── vault-token.clar          # SIP-010 share token
│   └── fee-collector.clar        # Fee management
├── tests/
│   ├── vault-core_test.ts        # Vault core tests
│   ├── vault-core_test.clar      # Clarity test suite
│   ├── vault-token_test.ts       # Token tests
│   └── fee-collector_test.ts     # Fee collector tests
├── docs/
│   └── CONTRACTS.md              # Detailed contract docs
├── Clarinet.toml                 # Clarinet configuration
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

## 🛠️ Development Workflow

1. **Make Changes**: Edit contracts in `contracts/` directory
2. **Check Syntax**: Run `clarinet check`
3. **Write Tests**: Add tests in `tests/` directory
4. **Run Tests**: Execute `clarinet test`
5. **Commit**: Use conventional commits format

## 🔮 Roadmap

### Phase 1 (Current) ✅
- [x] Core vault mechanics
- [x] SIP-010 token implementation
- [x] Fee collection system
- [x] Comprehensive test suite

### Phase 2 (Next)
- [ ] PoX stacking integration
- [ ] Bitcoin reward distribution
- [ ] Stacking pool management
- [ ] Multi-cycle support

### Phase 3 (Future)
- [ ] Web3 frontend interface
- [ ] Analytics dashboard
- [ ] Governance mechanisms
- [ ] Advanced reward strategies

## 📄 License

ISC License

## 👥 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Yusufolosun/vaultayield/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Yusufolosun/vaultayield/discussions)

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always audit smart contracts before mainnet deployment.

---

**Built with ❤️ on Stacks blockchain**
