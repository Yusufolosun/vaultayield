# 🚀 VaultaYield Mainnet Deployment Guide

**Version:** 1.0  
**Date:** 2026-01-30  
**Status:** Production Ready

This guide walks you through deploying VaultaYield to Stacks Mainnet.

---

## ⚠️ Before You Begin

**CRITICAL WARNINGS:**
- This deploys to MAINNET with REAL STX
- All transactions are IRREVERSIBLE
- Read this entire guide first
- Have backup of all private keys

**Required:**
- [ ] Completed security review (`docs/security-checklist.md`)
- [ ] 15+ STX in deployment wallet
- [ ] Private key securely backed up
- [ ] Tested scripts on testnet (optional but recommended)
- [ ] 2-3 hours of uninterrupted time

---

## 📋 Deployment Checklist

### Phase 1: Preparation (30 minutes)

- [ ] Complete security review
- [ ] Fund deployment wallet with 15+ STX
- [ ] Backup private key to secure location
- [ ] Set environment variable
- [ ] Test environment setup

### Phase 2: Deployment (30-40 minutes)

- [ ] Run deploy-mainnet.ts
- [ ] Monitor transaction confirmations
- [ ] Verify all 6 contracts deployed
- [ ] Save deployment record

### Phase 3: Configuration (10-15 minutes)

- [ ] Run configure-mainnet.ts
- [ ] Verify all linkages
- [ ] Save configuration record

### Phase 4: Verification (20-30 minutes)

- [ ] Check all contracts on explorer
- [ ] Test read-only functions
- [ ] Make first deposit (initialize share price)
- [ ] Verify entire system

### Phase 5: Documentation (30-60 minutes)

- [ ] Update README with mainnet addresses
- [ ] Update user-guide references
- [ ] Create deployment announcement
- [ ] Tag v1.0.0 release

---

## 🔒 Phase 1: Preparation

### Step 1.1: Complete Security Review

```bash
# Review the comprehensive security checklist
cat docs/security-checklist.md

# Go through each section:
# - Access Control
# - Arithmetic Safety
# - State Management
# - Input Validation
# - Error Handling
# - Integration Points
# - Emergency Controls
# - Vulnerabilities

# Sign off when satisfied
```

**DO NOT PROCEED** until security review is complete!

### Step 1.2: Fund Deployment Wallet

**Acquire STX:**
1. Purchase from exchange (Binance, Kraken, OKX, etc.)
2. Transfer to your deployment wallet address
3. **Recommended:** Use a fresh wallet for deployment

**Amount Needed:**
- Contract deployments: ~6-8 STX (6 × 0.5-1 STX each)
- Configuration: ~1.5-2 STX (5 × 0.2-0.3 STX each)
- Buffer for retries: ~2-3 STX
- **Total:** 15 STX (safe buffer)

**Verify Balance:**
```bash
# Check balance on explorer
https://explorer.hiro.so/address/YOUR_ADDRESS?chain=mainnet
```

### Step 1.3: Secure Your Private Key

**⚠️ CRITICAL SECURITY:**

```bash
# Option 1: Environment Variable (Windows PowerShell)
$env:DEPLOYER_PRIVATE_KEY = "your_private_key_here"

# Option 2: .env File (NOT committed to git!)
echo "DEPLOYER_PRIVATE_KEY=your_key" > .env

# Verify it's set (Windows)
echo $env:DEPLOYER_PRIVATE_KEY
```

**Backup Checklist:**
- [ ] Private key written down and stored securely
- [ ] Seed phrase backed up in multiple locations
- [ ] Hardware wallet backup (if using)
- [ ] Test restore procedure

**NEVER:**
- ❌ Commit private key to git
- ❌ Share private key in chat/email
- ❌ Store in plain text on cloud storage

### Step 1.4: Test Environment Setup

```powershell
# Verify Node.js installed
node --version  # Should be v18+

# Verify dependencies
npm install

# Verify TypeScript
npx ts-node --version

# Test environment variable
echo $env:DEPLOYER_PRIVATE_KEY  # Should show your key
```

---

## 🚀 Phase 2: Deployment

### Step 2.1: Final Pre-Flight Check

```powershell
# Ensure working directory is correct
cd C:\Users\OLOSUN\Documents\code\vaultayield

# Verify all contracts exist
ls contracts/*.clar

# Expected output:
# - vault-core.clar
# - vault-token.clar
# - fee-collector.clar
# - stacking-strategy.clar
# - harvest-manager.clar
# - compound-engine.clar

# Verify deploy script exists
ls scripts/deploy-mainnet.ts
```

### Step 2.2: Execute Deployment

```powershell
# Run deployment script
npm run deploy:mainnet

# OR directly:
npx ts-node scripts/deploy-mainnet.ts
```

**What Happens:**
```
⏰ 10-second countdown (Ctrl+C to cancel)
📦 Deploy vault-token (~2 min)
⏳ Wait 60 seconds
📦 Deploy fee-collector (~2 min)
⏳ Wait 60 seconds
📦 Deploy stacking-strategy (~2 min)
⏳ Wait 60 seconds
📦 Deploy harvest-manager (~2 min)
⏳ Wait 60 seconds
📦 Deploy compound-engine (~2 min)
⏳ Wait 60 seconds
📦 Deploy vault-core (~2 min)
✅ Summary displayed
📝 deployment-mainnet.json created
```

**Expected Timeline:** 20-30 minutes

### Step 2.3: Monitor Progress

**Real-Time Monitoring:**
- Watch console output for each contract
- Note transaction IDs (TxIDs)
- Click explorer links to verify

**Check Explorer:**
```
https://explorer.hiro.so/txid/[TXID]?chain=mainnet
```

**Deployment Record:**
```powershell
# View deployment record
cat deployment-mainnet.json

# Should contain:
# - timestamp
# - deployer address
# - 6 contract entries with TxIDs
```

### Step 2.4: Verify Deployment Success

**Check Summary:**
```
✅ Successful: 6/6
❌ Failed: 0/6

Deployed Contracts:
  - vault-token: [ADDRESS].vault-token
  - fee-collector: [ADDRESS].fee-collector
  - stacking-strategy: [ADDRESS].stacking-strategy
  - harvest-manager: [ADDRESS].harvest-manager
  - compound-engine: [ADDRESS].compound-engine
  - vault-core: [ADDRESS].vault-core
```

**If Any Failed:**
1. Check error message
2. Verify STX balance
3. Check nonce issues
4. Retry individual contract (manual process)
5. Contact support if persistent

---

## 🔧 Phase 3: Configuration

**⚠️ Wait for Confirmations!**

Before configuration:
- [ ] All 6 deployments confirmed (check explorer)
- [ ] All transactions show "Success" status
- [ ] Contracts visible on-chain

### Step 3.1: Execute Configuration

```powershell
# Run configuration script
npm run configure:mainnet

# OR directly:
npx ts-node scripts/configure-mainnet.ts
```

**What Happens:**
```
⚙️ vault-token.set-vault-core (~30s + 30s wait)
⚙️ fee-collector.set-vault-core (~30s + 30s wait)
⚙️ stacking-strategy.set-vault-core (~30s + 30s wait)
⚙️ vault-core.set-stacking-strategy (~30s + 30s wait)
⚙️ vault-core.enable-stacking (~30s)
✅ Summary displayed
📝 configuration-mainnet.json created
```

**Expected Timeline:** 5-10 minutes

### Step 3.2: Verify Configuration

**Check Summary:**
```
✅ Successful: 5/5

Completed Steps:
  - Set vault-core as authorized minter
  - Set vault-core as authorized caller
  - Set vault-core reference in stacking-strategy
  - Set stacking-strategy reference in vault-core
  - Enable stacking functionality
```

**Configuration Record:**
```powershell
cat configuration-mainnet.json
```

---

## ✅ Phase 4: Verification

### Step 4.1: Check Contracts on Explorer

**For Each Contract:**
```
https://explorer.hiro.so/txid/[ADDRESS].[CONTRACT_NAME]?chain=mainnet
```

**Verify:**
- [ ] Contract source code visible
- [ ] Clarity version: 2
- [ ] Contract deployed successfully
- [ ] Functions visible in explorer

### Step 4.2: Test Read-Only Functions

**Via Explorer:**

1. **vault-core.get-share-price**
   ```clarity
   Expected: u1000000 (1.0 with 6 decimals)
   ```

2. **vault-core.get-total-assets**
   ```clarity
   Expected: u0 (no deposits yet)
   ```

3. **vault-core.get-total-shares**
   ```clarity
   Expected: u0 (no shares minted)
   ```

4. **vault-token.get-name**
   ```clarity
   Expected: "VaultaYield Shares"
   ```

5. **vault-token.get-symbol**
   ```clarity
   Expected: "vySTX"
   ```

6. **vault-token.get-decimals**
   ```clarity
   Expected: u6
   ```

**All Should Work:** ✅

### Step 4.3: Make First Deposit (CRITICAL!)

**Why Important:**
The first deposit initializes the share price at 1:1 ratio.

**Recommended:**
- Deposit ~10-50 STX as contract owner
- Establishes initial share price
- Prevents first depositor manipulation

**How to Deposit:**
```clarity
1. Go to: [YOUR_ADDRESS].vault-core on explorer
2. Click "Call Function"
3. Select "deposit"
4. Amount: u10000000 (10 STX)
5. Confirm transaction
```

**Verify:**
```clarity
# After confirmation:
get-total-assets → u10000000 (10 STX)
get-total-shares → u10000000 (10 shares)
get-share-price → u1000000 (1.0)
```

### Step 4.4: End-to-End Test

**Optional but Recommended:**

1. **Test Withdrawal:**
   ```clarity
   withdraw u5000000  # Withdraw 5 shares
   ```
   - Should return ~4.975 STX (0.5% fee deducted)

2. **Check Fee Collection:**
   ```clarity
   get-accumulated-fees  # Should show ~0.025 STX
   ```

3. **Test Pause (Admin Only):**
   ```clarity
   pause-contract
   unpause-contract
   ```

**If All Pass:** System fully functional! ✅

---

## 📝 Phase 5: Documentation Updates

### Step 5.1: Update README.md

**Add Mainnet Addresses:**
```markdown
#### Mainnet (LIVE)
```
Deployer:          [YOUR_ADDRESS]
Vault Core:         [YOUR_ADDRESS].vault-core
Vault Token:        [YOUR_ADDRESS].vault-token
Fee Collector:      [YOUR_ADDRESS].fee-collector
Stacking Strategy:  [YOUR_ADDRESS].stacking-strategy
Harvest Manager:    [YOUR_ADDRESS].harvest-manager
Compound Engine:    [YOUR_ADDRESS].compound-engine

Explorer: https://explorer.hiro.so/address/[YOUR_ADDRESS]?chain=mainnet
```
```

### Step 5.2: Update User Guide

**In `docs/user-guide.md`:**

Update all example contract calls with mainnet addresses:
```clarity
# OLD (testnet)
(contract-call? 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.vault-core ...)

# NEW (mainnet)
(contract-call? '[YOUR_MAINNET_ADDRESS].vault-core ...)
```

### Step 5.3: Git Operations

```bash
# Stage changes
git add -A

# Commit
git commit -m "chore: Add mainnet deployment addresses

- Deployed all 6 contracts to mainnet
- Updated README with contract addresses
- Updated user guide with mainnet references
- Deployment timestamp: 2026-01-30

Mainnet deployer: [YOUR_ADDRESS]"

# Tag release
git tag -a v1.0.0 -m "VaultaYield v1.0.0 - Mainnet Launch

First production release on Stacks Mainnet
- Core vault functionality (98.2% tested)
- Bitcoin yield through PoX stacking
- Auto-compounding mechanism
- SIP-010 share tokens

Deployment: [YOUR_ADDRESS]"

# Push to GitHub
git push origin dev
git push origin v1.0.0
```

### Step 5.4: Create Deployment Announcement

**Create:** `LAUNCH_ANNOUNCEMENT.md`

```markdown
# 🚀 VaultaYield Mainnet Launch!

**Date:** [Deployment Date]
**Network:** Stacks Mainnet
**Status:** LIVE

## What is VaultaYield?

Bitcoin-native yield vault that automatically:
- Stakes your STX via PoX
- Earns Bitcoin rewards
- Compounds profits back into your position
- Maximizes your returns

## Contract Addresses

Vault Core: [`[ADDRESS].vault-core`](https://explorer.hiro.so/txid/[ADDRESS].vault-core?chain=mainnet)
Vault Token: `[ADDRESS].vault-token`

## How to Start

1. Get STX tokens
2. Connect wallet (Leather/Xverse)
3. Deposit STX into vault
4. Earn Bitcoin rewards automatically!

Full guide: [User Guide](docs/user-guide.md)

## Stats

- Tested: 99 on-chain transactions
- Success Rate: 98.2%
- Security: Comprehensive checklist
- Documentation: 7 guides

## Links

- GitHub: https://github.com/Yusufolosun/vaultayield
- Docs: [README](README.md)
- FAQ: [docs/faq.md](docs/faq.md)

**Built for Bitcoin DeFi on Stacks!** 🎯
```

---

## 🎉 Success!

If you've completed all phases:

**✅ Contracts Deployed**
**✅ Configuration Complete**
**✅ System Verified**
**✅ Documentation Updated**
**✅ v1.0.0 Tagged**

**Your VaultaYield is LIVE on Mainnet!** 🚀

---

## 🆘 Troubleshooting

### Deployment Failed

**"Insufficient funds":**
- Check STX balance
- Add more STX to wallet
- Retry deployment

**"Nonce too low/high":**
- Script auto-manages nonces
- If manual retry needed, check explorer for last nonce
- Update script or wait

**"Transaction timeout":**
- Mainnet can be slow
- Wait up to 30 minutes
- Check explorer for transaction status

### Configuration Failed

**"Contract not found":**
- Deployments may not be confirmed yet
- Wait 5-10 more minutes
- Retry configuration

**"Not authorized":**
- Ensure same private key used
- Verify deployer address matches

### Verification Issues

**Read-only calls fail:**
- Wait for full confirmation
- Clear browser cache
- Try different explorer instance

**First deposit fails:**
- Check STX balance
- Verify contract not paused
- Check amount > 0

---

## 📞 Support

**Issues?**
- GitHub: https://github.com/Yusufolosun/vaultayield/issues
- Review: `docs/security-checklist.md`
- Review: `docs/testnet-validation-report.md`

**Before Asking:**
1. Check transaction on explorer
2. Review error message
3. Verify STX balance
4. Check nonce sequence

---

## 📋 Post-Deployment Checklist

- [ ] All 6 contracts deployed
- [ ] All 5 configurations complete
- [ ] All functions verified
- [ ] First deposit made
- [ ] Documentation updated
- [ ] v1.0.0 tagged
- [ ] Announcement created
- [ ] Community notified

**Congratulations on launching VaultaYield!** 🎊

---

*Last Updated: 2026-01-30*  
*Version: 1.0*
