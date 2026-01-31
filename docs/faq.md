# VaultaYield FAQ (Frequently Asked Questions)

Quick answers to common questions about VaultaYield.

---

## General Questions

### What is VaultaYield?

VaultaYield is a Bitcoin-native yield vault built on Stacks blockchain. It automatically stakes your STX through PoX (Proof of Transfer) to earn Bitcoin rewards, then reinvests those rewards to compound your returns.

### How does it work?

1. You deposit STX
2. Vault stakes STX via PoX
3. Earns BTC rewards (~2 weeks)
4. BTC converted to STX and reinvested
5. Your share value grows automatically

### Is it safe?

VaultaYield has been:
- ✅ Extensively tested (99 on-chain transactions)
- ✅ Self-reviewed with security checklist
- ✅ Validated on testnet (98.2% success)
- ⚠️ Not formally audited (use at own risk)

All code is open-source and can be reviewed on GitHub.

---

## Getting Started

### What do I need to use VaultaYield?

- STX tokens (any amount)
- Stacks wallet (Leather, Xverse, or Hiro)
- Basic understanding of blockchain transactions

### Is there a minimum deposit?

No official minimum, but **5+ STX recommended** for meaningful earnings (gas fees can eat tiny deposits).

### How do I deposit?

1. Go to vault-core contract on Stacks Explorer
2. Call `deposit` function
3. Enter amount in microSTX (1 STX = 1,000,000)
4. Confirm transaction
5. Receive vySTX shares

Full guide: [User Guide](user-guide.md#how-to-deposit)

---

## Returns & Rewards

### How much can I earn?

**Expected APY: ~8-15%** (not guaranteed)

Based on:
- PoX stacking: ~5-12% base APY
- Compounding boost: ~20-40%
- Market conditions vary

### When do I get rewards?

**You don't claim rewards!** They're automatically compounded back into  your position. Your vySTX shares increase in value over time.

### How do I track my earnings?

Check the **share price**:
```clarity
(contract-call? .vault-core get-share-price)
```

If share price is growing, you're earning! ✅

**Example:**
```
Day 1:  Share price 1.0 → Your 100 vySTX worth 100 STX
Day 30: Share price 1.1 → Your 100 vySTX worth 110 STX (10% gain!)
```

---

## Shares & vySTX

### What are vySTX?

**vySTX** = VaultaYield STX shares

They're SIP-010 tokens representing your portion of the vault. As the vault grows, your vySTX become more valuable.

### Can I transfer vySTX?

**Yes!** vySTX are standard tokens. You can:
- Transfer to other wallets
- Trade on DEXs (if listed)
- Hold in any SIP-010 compatible wallet

⚠️ **Warning:** Transferring vySTX = transferring your vault position

### Do vySTX decrease in value?

**No!** (Under normal circumstances)

vySTX can only:
- Stay the same (vault not growing)
- Increase (vault earning profits)

They won't decrease unless vault suffers losses (very unlikely with PoX).

---

## Withdrawals

### When can I withdraw?

You can withdraw **between stacking cycles** (~1-2 day windows every 2 weeks).

Cannot withdraw while STX is locked in PoX stacking.

### How do I check if I can withdraw?

```clarity
(contract-call? .stacking-strategy is-unlocked)

true = Can withdraw ✅
false = Locked, wait for cycle end ⏳
```

### What if I need emergency access?

**Plan ahead!** Lock periods are ~2 weeks.

If true emergency:
- Contact team via GitHub
- Admin can pause contract (extreme cases)
- Future: Emergency withdrawal mechanism

**Best practice:** Only deposit funds you won't need for 3+ months.

### How much do I receive when withdrawing?

```
STX Received = (vySTX × Share Price) - 0.5% fee

Example:
- Withdraw: 100 vySTX
- Share price: 1.1
- Gross: 110 STX
- Fee: 0.55 STX (0.5%)
- Net: 109.45 STX
```

---

## Fees

### What fees do I pay?

| Fee Type | Rate | When |
|----------|------|------|
| **Deposit** | 0% | Never! |
| **Withdrawal** | 0.5% | When withdrawing |
| **Performance** | 15% | On profits only |

### Why is there a withdrawal fee?

**Protects all users** from:
- Flash deposit attacks
- Share price manipulation
- Gaming the compounding system

Fees support protocol operations.

### Is 15% performance fee too high?

**Only charged on new profits**, not your deposit!

**Example:**
```
Your deposit: 100 STX → 0% fee
Vault earns: 10 STX profit → 1.5 STX fee (15%)
You get: 108.5 STX total
Your net gain: 8.5 STX ✅
```

You still profit, and it funds sustainable development.

---

## Technical Questions

### What blockchain is this on?

**Stacks blockchain** - which settles on Bitcoin for security.

### What contracts are involved?

6 main contracts:
1. **vault-core** - Main deposit/withdrawal logic
2. **vault-token** - vySTX share token (SIP-010)
3. **fee-collector** - Fee management
4. **stacking-strategy** - PoX integration
5. **harvest-manager** - Reward collection
6. **compound-engine** - Auto-compounding

See: [Technical Spec](technical-spec.md)

### Is the code open source?

**Yes!** Fully open source:

GitHub: https://github.com/Yusufolosun/vaultayield

### Has it been audited?

- ✅ Self-reviewed (comprehensive checklist)
- ✅ Tested extensively on testnet
- ⏳ Formal audit planned (community funded)

View security checklist: [Security Review](security-checklist.md)

---

## Risks & Safety

### What are the risks?

**Smart Contract Risk:**
- Code could have bugs
- Not formally audited
- Use at your own risk

**Lock Period Risk:**
- Funds locked ~2 weeks during stacking
- Cannot access during lock

**Market Risk:**
- STX/BTC prices fluctuate
- Returns not guaranteed

**Mitigation:**
- Start with small amounts
- Only deposit long-term funds
- Understand lock periods

### What if something goes wrong?

**Emergency Controls:**
- Admin can pause contract
- Stacking can be revoked
- Funds never permanently locked

**Support:**
- Report issues on GitHub
- Community help via Discord
- Documentation always available

### Can I lose money?

**Unlikely** scenarios:
- Major smart contract bug (tested to minimize)
- Extreme market crash (affects all DeFi)
- Pool operator failure (diversification planned)

**Likely** scenario:
- Earn steady BTC yield through PoX ✅

---

## Compounding

### How does auto-compounding work?

**Automatic process:**
1. PoX stacking earns BTC (~every 2 weeks)
2. Protocol harvests BTC rewards
3. BTC swapped to STX via DEX
4. Performance fee deducted (15%)
5. Net STX deposited back into vault
6. Share price increases
7. **Your vySTX now worth more!** ✅

### Do I need to claim or compound manually?

**No!** Everything is automatic. Just hold your vySTX.

### How often does compounding happen?

~Every 2 weeks (each PoX stacking cycle)

More frequent after mainnet optimizations.

---

## Comparisons

### VaultaYield vs Regular PoX Stacking?

| Feature | VaultaYield | Regular PoX |
|---------|-------------|-------------|
| Minimum | Any amount | ~100K STX |
| Setup | Automatic | Manual |
| Rewards | Auto-compounded | Manual claim |
| Returns | 8-15% APY | 5-12% APY |
| Liquidity | 2-week cycles | 2-week cycles |
| Fees | 0.5% + 15% profit | Pool fees vary |

### VaultaYield vs Other Stacks Vaults?

VaultaYield is unique:
- ✅ Bitcoin rewards (not just STX yield)
- ✅ True auto-compounding
- ✅ SIP-010 share tokens
- ✅ Transparent, open-source

---

## Mainnet & Deployment

### Is VaultaYield live on mainnet?

**Status:** Testnet validated, mainnet deployment pending

Check README for latest: [README.md](../README.md)

### When mainnet?

Waiting for:
- Final security review completion
- Mainnet deployment funding (~15 STX)
- Community readiness

**Target:** Q1 2026

### Can I use it on testnet?

**Yes!** Testnet contracts are live:

Deployer: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0`

[Testnet Explorer](https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet)

---

## Advanced

### Can VaultaYield be integrated into other protocols?

**Yes!** vySTX tokens can be:
- Listed on DEXs
- Used as collateral in lending
- Composed with other DeFi
- Integrated into aggregators

See: [Developer Guide](developer-guide.md)

### What DEXs does compounding use?

Currently supports:
- Velar (primary)
- ALEX (secondary)
- Bitflow (planned)

Multiple DEX support prevents single point of failure.

### Can I build on top of VaultaYield?

**Absolutely!** It's open source and composable.

Ideas:
- Automated rebalancing strategies
- Liquidity provision with vySTX
- Leveraged yield farming
- Portfolio trackers

---

## Getting Help

### Where can I get support?

**Documentation:**
- [User Guide](user-guide.md) - How-to guides
- [Technical Spec](technical-spec.md) - Deep dive
- [Developer Guide](developer-guide.md) - Integration

**Community:**
- GitHub Issues: Bug reports
- Stacks Discord: #DeFi channel
- Twitter: Updates and announcements

### How do I report a bug?

1. Go to: https://github.com/Yusufolosun/vaultayield/issues
2. Click "New Issue"
3. Describe the bug with details
4. Include transaction IDs if applicable

Security issues: Email privately (see SECURITY.md)

### Can I contribute?

**Yes!** Contributions welcome:
- Code improvements
- Documentation fixes
- Testing
- Community support

See: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## Quick Answers

**Q: Is it safe?**  
A: Tested extensively, but use at own risk (not audited).

**Q: How much can I earn?**  
A: ~8-15% APY estimated (not guaranteed).

**Q: When can I withdraw?**  
A: Between PoX cycles (~every 2 weeks).

**Q: Are there fees?**  
A: 0% deposit, 0.5% withdrawal, 15% performance (profit only).

**Q: What are vySTX?**  
A: Your vault shares (SIP-010 tokens).

**Q: Can vySTX lose value?**  
A: No, they can only stay same or increase.

**Q: Is there a minimum?**  
A: No official minimum, 5+ STX recommended.

**Q: How do I start?**  
A: Get STX, deposit, receive vySTX, earn automatically!

---

## Still Have Questions?

**Check other docs:**
- [User Guide](user-guide.md) - Detailed how-to
- [Technical Spec](technical-spec.md) - Contract details
- [Testnet Report](testnet-validation-report.md) - Test results

**Or ask the community:**
- GitHub: https://github.com/Yusufolosun/vaultayield
- Discord: Stacks #DeFi channel

---

**Happy Earning!** 🚀

*Last Updated: 2026-01-30*
