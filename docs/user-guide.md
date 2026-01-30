# VaultaYield User Guide

Complete guide for using VaultaYield to earn Bitcoin rewards on your STX holdings.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Vault](#understanding-the-vault)
3. [How to Deposit](#how-to-deposit)
4. [Understanding Your Shares](#understanding-your-shares)
5. [How Rewards Work](#how-rewards-work)
6. [How to Withdraw](#how-to-withdraw)
7. [Fees Explained](#fees-explained)
8. [Risks & Best Practices](#risks--best-practices)
9. [Frequently Asked Questions](#frequently-asked-questions)

---

## Getting Started

### Prerequisites

Before using VaultaYield, you need:

1. **STX Tokens** - The native token of Stacks blockchain
2. **Stacks Wallet** - Recommended: [Leather](https://leather.io/), [Xverse](https://www.xverse.app/), or [Hiro Wallet](https://wallet.hiro.so/)
3. **Basic Understanding** - Know how to send blockchain transactions

### Wallet Setup

**Install a Wallet:**
```
1. Visit leather.io or xverse.app
2. Install browser extension
3. Create new wallet or import existing
4. Securely backup your seed phrase
5. Fund wallet with STX tokens
```

**⚠️ Security Tips:**
- Never share your seed phrase
- Use hardware wallet for large amounts
- Verify contract addresses before interacting

---

## Understanding the Vault

### What is VaultaYield?

VaultaYield is a **yield optimization protocol** that:
- Accepts STX deposits from users
- Stakes STX through Stacks PoX mechanism
- Earns BTC rewards every ~2 weeks
- Converts BTC to STX and reinvests
- Grows your position automatically

### How It's Different

| Traditional Stacking | VaultaYield |
|---------------------|-------------|
| Manual setup required | Automatic |
| Minimum 100K STX | Any amount accepted |
| Manual reward claiming | Auto-compounded |
| Fixed lock periods | Flexible (between cycles) |
| BTC rewards only | BTC + compounding growth |

---

## How to Deposit

### Via Stacks Explorer (Recommended)

**Step 1: Navigate to Contract**
```
https://explorer.hiro.so/txid/[DEPLOYER_ADDRESS].vault-core?chain=mainnet
```

**Step 2: Call Deposit Function**
1. Click "Call Function" button
2. Select `deposit` function
3. Connect your wallet
4. Enter amount in microSTX (1 STX = 1,000,000 microSTX)

**Example:**
```clarity
;; Deposit 10 STX
Amount: 10000000

;; Deposit 100 STX  
Amount: 100000000
```

**Step 3: Confirm Transaction**
1. Review transaction details
2. Check fee (usually ~0.001-0.002 STX)
3. Confirm in wallet
4. Wait for confirmation (~1-2 blocks, 10-20 minutes)

**Step 4: Receive Shares**
You'll automatically receive vySTX share tokens representing your vault position.

### Via Wallet DApp Browser (Future)

Once VaultaYield frontend launches, deposits will be even easier through a user-friendly interface.

---

## Understanding Your Shares

### What are vySTX?

**vySTX** = VaultaYield STX shares
- SIP-010 compliant fungible token
- Represents your portion of the vault
- Automatically appreciates as vault grows
- Can be transferred like any token

### Share Price Mechanism

```
Share Price = Total Vault Assets / Total Shares

Initial deposit (first user):
- Deposit: 100 STX
- Receive: 100 vySTX
- Share price: 1.0

After compounding (30 days later):
- Total assets: 110 STX (10% growth)
- Total shares: 100 vySTX  
- Share price: 1.1

Your position:
- Hold: 100 vySTX
- Value: 100 × 1.1 = 110 STX
- Profit: 10 STX ✅
```

### Checking Your Balance

**Method 1: Via Explorer**
```
1. Go to vault-token contract
2. Call get-balance function
3. Enter your wallet address
4. View vySTX balance
```

**Method 2: In Wallet**
```
Most wallets show SIP-010 tokens automatically
Look for "vySTX" in your token list
```

**Method 3: Calculate Value**
```clarity
;; Get current value of your shares
(contract-call? .vault-core get-user-stx-value 'YOUR_ADDRESS)

;; Returns your STX value at current share price
```

---

## How Rewards Work

### PoX Stacking Cycles

**Cycle Timeline:**
- Duration: ~2 weeks (2,100 Bitcoin blocks)
- Your STX: Locked during stacking
- Rewards: BTC paid at cycle end
- Unlock: Brief window between cycles

**Cycle Phases:**
```
┌─────────────┬─────────────┬─────────────┐
│  Prepare    │   Stacking  │   Reward    │
│  (1-2 days) │  (~14 days) │  (1-2 days) │
└─────────────┴─────────────┴─────────────┘
     ↓              ↓              ↓
  Delegate      STX Locked    BTC Earned
```

### Reward Distribution

**Harvesting Process:**
1. **Collection**: Protocol detects BTC rewards
2. **Verification**: Rewards recorded on-chain
3. **Conversion**: BTC swapped for STX via DEX
4. **Fee Deduction**: 15% performance fee
5. **Compounding**: Net STX deposited back into vault
6. **Growth**: Share price increases

**Impact on You:**
- No manual claiming needed ✅
- Rewards automatically reinvested ✅
- Position grows exponentially ✅
- Tax-efficient (no periodic distributions) ✅

### Example: 100 STX Over 90 Days

**Assumptions:**
- Initial deposit: 100 STX
- PoX APY: ~8% annually (~2% per cycle)
- 3 cycles in 90 days

**Growth:**
```
Cycle 1 (Day 0-14):
- Start: 100 STX
- Earn: 2 STX in BTC
- Performance fee: 0.3 STX (15%)
- Compound: 1.7 STX
- End: 101.7 STX

Cycle 2 (Day 14-28):
- Start: 101.7 STX
- Earn: 2.03 STX
- Performance fee: 0.3 STX
- Compound: 1.73 STX
- End: 103.43 STX

Cycle 3 (Day 28-42):
- Start: 103.43 STX
- Earn: 2.07 STX
- Performance fee: 0.31 STX
- Compound: 1.76 STX
- End: 105.19 STX

After 90 Days:
- Value: 105.19 STX
- Profit: 5.19 STX (5.19% return)
- Effective APY: ~21% (with compounding)
```

---

## How to Withdraw

### Withdrawal Process

**Step 1: Check If Unlocked**
```clarity
;; Check stacking status
(contract-call? .stacking-strategy is-unlocked)

;; Returns:
;; true = Can withdraw ✅
;; false = Locked (wait for cycle end) ⏳
```

**Step 2: Initiate Withdrawal**
```
1. Go to vault-core contract on explorer
2. Call "withdraw" function
3. Enter vySTX shares to withdraw
4. Confirm transaction
```

**Step 3: Receive STX**
```
STX Returned = (Shares × Share Price) - Withdrawal Fee

Example:
- Withdraw: 100 vySTX
- Share price: 1.1
- Gross STX: 110 STX
- Withdrawal fee (0.5%): 0.55 STX
- Net received: 109.45 STX ✅
```

### Withdrawal Scenarios

**Full Withdrawal:**
```clarity
;; Withdraw all shares
;; First, check your balance
(contract-call? .vault-token get-balance tx-sender)

;; Then withdraw that amount
(contract-call? .vault-core withdraw u100000000)
```

**Partial Withdrawal:**
```clarity
;; Withdraw 50% of position
;; If you have 100 vySTX, withdraw 50
(contract-call? '.vault-core withdraw u50000000)
```

### Lock Periods

**⚠️ IMPORTANT**: Cannot withdraw during active stacking!

**When You Can Withdraw:**
- Between stacking cycles (1-2 day windows)
- After explicitly unlocking (if not re-stacking)
- During emergency pause (if enabled)

**Planning Your Withdrawal:**
```
1. Check current cycle: ~2 weeks remaining
2. Set reminder for cycle end
3. Withdraw during unlock window
4. Or wait for next unlock
```

---

## Fees Explained

### Withdrawal Fee: 0.5%

**Purpose:**
- Prevents flash deposit attacks
- Protects long-term holders
- Discourages gaming the system

**Calculation:**
```
Fee = Gross STX Returned × 0.005

Example:
- Withdraw value: 110 STX
- Fee: 110 × 0.005 = 0.55 STX
- You receive: 109.45 STX
```

**Who Benefits:**
- Fees go to protocol treasury
- Used for development and operations
- Benefits entire ecosystem

### Performance Fee: 15%

**Purpose:**
- Sustainable protocol funding
- Aligned incentives (only profit)
- Developer compensation

**Calculation:**
```
Fee = BTC Profits (in STX) × 0.15

Example:
- BTC rewards: 10 STX worth
- Performance fee: 10 × 0.15 = 1.5 STX
- Compounded: 8.5 STX
```

**Key Points:**
- Only charged on **new profits**
- Your original deposit: **never** charged
- Vault losing money: **zero** fees
-Charged during compounding (invisible to users)

### No Deposit Fee ✅

**Free to enter!**
```
Deposit 100 STX → Receive 100 vySTX (at current price)
No fees deducted
```

---

## Risks & Best Practices

### Understand the Risks

**Smart Contract Risk:**
- Code has been tested but not formally audited
- Bugs could lead to loss of funds
- Use at your own risk

**PoX Lock Risk:**
- Funds locked during stacking (~2 weeks)
- Cannot access funds during lock
- Plan for illiquidity

**Market Risk:**
- STX price can fluctuate
- BTC rewards value varies
- No guaranteed returns

**Pool Operator Risk:**
- Stacking depends on pool operator
- Operator failure affects rewards
- Diversification planned (future)

### Best Practices

**Start Small:**
```
✅ Deposit 10-50 STX first
✅ Understand the process
✅ Wait one cycle
✅ Deposit more if satisfied
```

**Don't Invest What You Need:**
```
❌ Don't deposit emergency funds
❌ Don't deposit money needed soon
✅ Only deposit long-term holdings (3+ months)
```

**Monitor Your Position:**
```
Weekly:
- Check share price
- Verify stacking status
- Review rewards

Monthly:
- Calculate returns
- Rebalance if needed
- Assess performance
```

**Security:**
```
✅ Verify contract addresses
✅ Use hardware wallet for large amounts
✅ Never share private keys
✅ Double-check transactions
```

---

## Frequently Asked Questions

### How much can I earn?

**Expected Returns:**
- PoX base yield: ~5-12% APY (varies)
- Compounding boost: +20-40% (estimated)
- **Total potential**: ~8-15% APY

*Returns not guaranteed and vary based on market conditions*

### When can I withdraw?

You can withdraw **between stacking cycles** or after unlock periods. Check current cycle status before planning withdrawal.

### What are vySTX tokens?

vySTX are **vault share tokens** (SIP-010 compliant). They represent your portion of the vault and automatically appreciate as profits compound.

### Can I transfer my vySTX?

**Yes!** vySTX are standard SIP-010 tokens and can be:
- Transferred to other wallets
- Traded on DEXs (if listed)
- Used as collateral (future)

*Note: Transferring shares = transferring vault position*

### What happens if the vault loses money?

The vault strategy is conservative (PoX stacking), so losses are unlikely. However:
- No performance fees charged on losses
- Share price may stay flat or decrease
- Long-term: BTC rewards should cover any dips

### How do I know it's working?

**Check Share Price:**
```clarity
(contract-call? .vault-core get-share-price)

;; Returns: price with 6 decimals
;; Example: u1100000 = 1.1 (10% growth)
```

**If share price growing = vault working!** ✅

### Is there a minimum deposit?

**Currently:** No official minimum
**Recommended:** 5+ STX for meaningful earnings
**Gas consideration:** Very small deposits may be eaten by gas fees

### Can I compound manually?

**No need!** Compounding happens automatically. Just hold your vySTX and watch them grow.

### What if I need emergency access?

**Emergency scenarios:**
- Contact support if issues
- Admin can pause contract (emergency stop)
- Future: Emergency withdrawal mechanism

*Always plan for lock periods*

---

## Getting Help

### Support Channels

- **GitHub Issues**: https://github.com/Yusufolosun/ vaultayield/issues
- **Documentation**: https://github.com/Yusufolosun/vaultayield/tree/main/docs
- **Stacks Discord**: #DeFi channel

### Resources

- [Technical Specification](technical-spec.md) - Deep dive into contracts
- [Developer Guide](developer-guide.md) - Integration information
- [Testnet Report](testnet-validation-report.md) - Test results

---

## Quick Reference Card

```
╔══════════════════════════════════════════════════╗
║           VaultaYield Quick Reference            ║
╠══════════════════════════════════════════════════╣
║ Deposit:     Call vault-core.deposit()           ║
║ Withdraw:    Call vault-core.withdraw()          ║
║ Check Value: Call get-user-stx-value()           ║
║ Share Price: Call get-share-price()              ║
╠══════════════════════════════════════════════════╣
║ Fees:                                            ║
║  • Deposit: 0%                                   ║
║  • Withdrawal: 0.5%                              ║
║  • Performance: 15% (profits only)               ║
╠══════════════════════════════════════════════════╣
║ Lock Period: ~2 weeks per stacking cycle         ║
║ Unlock Window: 1-2 days between cycles           ║
║ Rewards: Auto-compounded (no claiming needed)    ║
╚══════════════════════════════════════════════════╝
```

---

**Happy Stacking!** 🚀

*Last Updated: 2026-01-30*
