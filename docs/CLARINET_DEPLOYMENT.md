# 🔐 Clarinet Deployment Configuration Guide

## Using Clarinet's Native Configuration

Clarinet uses TOML files in the `settings/` directory for network-specific configurations. This is the recommended approach for Stacks deployments.

---

## 📝 Setup Instructions

### Step 1: Create Your Configuration Files

```bash
# Copy templates to create actual config files
cp settings/Testnet.toml.example settings/Testnet.toml
cp settings/Mainnet.toml.example settings/Mainnet.toml
```

**Note**: `Testnet.toml` and `Mainnet.toml` are gitignored and will NEVER be committed.

### Step 2: Get Your Mnemonic

Your **mnemonic** is your 24-word seed phrase from your Stacks wallet.

#### From Hiro Wallet:
1. Open https://wallet.hiro.so/
2. Click your account → Settings
3. Click "View Secret Key"
4. Copy your 24-word mnemonic phrase

#### From Leather Wallet:
1. Open Leather wallet
2. Go to Settings
3. Click "Backup Secret Key"
4. Copy your 24-word mnemonic phrase

#### Generate New Wallet (CLI):
```bash
npm install -g @stacks/cli
stx make_keychain -t
```

### Step 3: Add Mnemonic to Testnet.toml

Edit `settings/Testnet.toml`:

```toml
[network]
name = "testnet"
stacks_node_rpc_address = "https://stacks-node-api.testnet.stacks.co"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "your actual 24 word mnemonic phrase goes here"
```

**Example** (DO NOT use this mnemonic):
```toml
[accounts.deployer]
mnemonic = "sound idle panel often situate develop unit text design antenna vendor screen opinion balcony share trigger accuse scatter visa uniform brass update opinion media"
```

---

## 🚀 Deploying to Testnet

### Option 1: Using Clarinet Deploy (Recommended)

```bash
# Deploy all contracts to testnet
clarinet deployments apply --network=testnet
```

This will:
- Read credentials from `settings/Testnet.toml`
- Deploy all contracts in dependency order
- Save deployment plan in `deployments/testnet.yaml`

### Option 2: Using Custom Script

If you prefer the TypeScript deployment script:

```bash
# Update script to use Clarinet config
npx ts-node scripts/deploy-with-clarinet.ts
```

---

## 📋 Testnet Deployment Checklist

- [ ] Copy `Testnet.toml.example` to `Testnet.toml`
- [ ] Add your 24-word mnemonic to `Testnet.toml`
- [ ] Get testnet STX from faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- [ ] Verify `Testnet.toml` is NOT in git: `git status`
- [ ] Run: `clarinet deployments apply --network=testnet`
- [ ] Verify contracts on explorer: https://explorer.hiro.so/?chain=testnet

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `Testnet.toml` and `Mainnet.toml` in `.gitignore`
- Use different mnemonics for testnet vs mainnet
- Store mnemonics securely (password manager, hardware wallet)
- Make backups of your mnemonics

### ❌ NEVER:
- Commit `Testnet.toml` or `Mainnet.toml` to git
- Share your mnemonic publicly
- Use testnet mnemonic on mainnet
- Store mnemonics in plain text files elsewhere

---

## 🔍 Verify Setup

### Check if files are gitignored:
```bash
git status
# Testnet.toml and Mainnet.toml should NOT appear
```

### Test deployment (dry run):
```bash
clarinet deployments generate --network=testnet
# This creates deployment plan without executing
```

### View your testnet address:
```bash
clarinet accounts list --network=testnet
```

---

## 📁 File Structure

```
settings/
├── Devnet.toml          # Local development (in git)
├── Testnet.toml.example # Template (in git)
├── Testnet.toml         # Your testnet config (gitignored)
├── Mainnet.toml.example # Template (in git)
└── Mainnet.toml         # Your mainnet config (gitignored)
```

---

## 🛠️ Troubleshooting

### "Could not find Testnet.toml"
- Ensure you copied `Testnet.toml.example` to `Testnet.toml`
- Check file is in `settings/` directory

### "Invalid mnemonic"
- Must be exactly 24 words
- Words separated by single spaces
- Surround entire phrase in quotes
- Use lowercase

### "Insufficient balance"
- Get testnet STX from faucet
- Wait 30-60 seconds for confirmation
- Check balance: https://explorer.hiro.so/?chain=testnet

---

## 📚 Additional Resources

- **Clarinet Docs**: https://docs.hiro.so/clarinet
- **Stacks Testnet Explorer**: https://explorer.hiro.so/?chain=testnet
- **Testnet Faucet**: https://explorer.hiro.so/sandbox/faucet?chain=testnet

---

## ⚡ Quick Start

```bash
# 1. Create config file
cp settings/Testnet.toml.example settings/Testnet.toml

# 2. Edit and add your mnemonic
notepad settings/Testnet.toml

# 3. Get testnet STX from faucet

# 4. Deploy!
clarinet deployments apply --network=testnet
```

---

**Ready to deploy? Follow the steps above and you're good to go!** 🚀
