# 🔐 VaultaYield Testnet Key Setup Guide

## ⚠️ SECURITY FIRST

**CRITICAL**: Your private key controls your testnet STX. Keep it secure!

- ✅ **DO**: Store in `.env` file (gitignored)
- ✅ **DO**: Keep backups in secure location
- ❌ **NEVER**: Commit private keys to git
- ❌ **NEVER**: Share keys publicly
- ❌ **NEVER**: Use testnet keys on mainnet

---

## 🔑 Step 1: Get Your Private Key

### Option A: From Hiro Wallet

1. Open Hiro Web Wallet: https://wallet.hiro.so/
2. Click your account in top right
3. Click "View Secret Key"
4. **Important**: This shows your 24-word mnemonic
5. To get hex private key, use Stacks.js:

```javascript
// Install: npm install @stacks/wallet-sdk
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');
const { TransactionVersion } = require('@stacks/transactions');

const mnemonic = "your 24 word mnemonic phrase here";
const wallet = await generateWallet({
  secretKey: mnemonic,
  password: '',
});

const account = wallet.accounts[0];
console.log("Private Key:", account.stxPrivateKey);
console.log("Testnet Address:", getStxAddress({ account, transactionVersion: TransactionVersion.Testnet }));
```

### Option B: Generate New Key Pair

```bash
# Using Stacks CLI
npm install -g @stacks/cli

# Generate new testnet account
stx make_keychain -t

# Output will show:
# - mnemonic (24 words)
# - privateKey (64 char hex)
# - address (testnet address)
```

### Option C: From Leather Wallet

1. Open Leather wallet
2. Go to Settings → View Secret Key
3. Export private key
4. Copy the hex string (64 characters)

---

## 📝 Step 2: Create .env File

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file:**
   ```bash
   # Windows
   notepad .env
   
   # Mac/Linux
   nano .env
   ```

3. **Add your private key:**
   ```env
   DEPLOYER_PRIVATE_KEY=your_64_character_hex_key_here
   ```

4. **Verify it's gitignored:**
   ```bash
   git status
   # .env should NOT appear in the list
   ```

---

## ✅ Step 3: Verify Setup

### Check Your Testnet Balance

```bash
# Visit Stacks Explorer
https://explorer.hiro.so/address/[YOUR_TESTNET_ADDRESS]?chain=testnet

# Or use API
curl https://stacks-node-api.testnet.stacks.co/extended/v1/address/[YOUR_ADDRESS]/stx
```

### Test Key Loading

Create `scripts/test-key-setup.ts`:

```typescript
import * as dotenv from 'dotenv';
dotenv.config();

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!privateKey) {
  console.error("❌ DEPLOYER_PRIVATE_KEY not found in .env");
  process.exit(1);
}

if (privateKey.length !== 64) {
  console.error("❌ Private key must be 64 hex characters");
  process.exit(1);
}

if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
  console.error("❌ Private key must be valid hex");
  process.exit(1);
}

console.log("✅ Private key loaded successfully");
console.log("✅ Key length: 64 characters");
console.log("✅ Format: Valid hex");
console.log("\n🔐 First 8 chars:", privateKey.substring(0, 8) + "...");
console.log("Ready for deployment!");
```

Run test:
```bash
npx ts-node scripts/test-key-setup.ts
```

---

## 💰 Step 4: Fund Your Testnet Account

1. **Visit Testnet Faucet:**
   ```
   https://explorer.hiro.so/sandbox/faucet?chain=testnet
   ```

2. **Enter your testnet address**

3. **Request STX** (you'll get ~500 testnet STX)

4. **Wait for confirmation** (~30 seconds)

5. **Verify balance:**
   ```bash
   # Check on explorer
   https://explorer.hiro.so/address/[YOUR_ADDRESS]?chain=testnet
   ```

---

## 🚀 Step 5: Ready to Deploy!

Once you have:
- ✅ Private key in `.env`
- ✅ Testnet STX in your wallet (minimum 2 STX)
- ✅ Key setup verified

You're ready to deploy:

```bash
# Deploy all contracts
npx ts-node scripts/deploy-testnet.ts
```

---

## 🔧 Troubleshooting

### "DEPLOYER_PRIVATE_KEY not found"
- Ensure `.env` file exists in project root
- Check file is named exactly `.env` (not `.env.txt`)
- Verify variable name is `DEPLOYER_PRIVATE_KEY`

### "Invalid private key format"
- Must be 64 hex characters (0-9, a-f)
- No spaces, no "0x" prefix
- Example format: `a1b2c3d4e5f6...` (64 chars total)

### "Insufficient balance"
- Visit faucet and request more testnet STX
- Wait 30-60 seconds for confirmation
- Check balance on explorer

### ".env file appears in git status"
- Run: `git rm --cached .env`
- Verify `.env` is in `.gitignore`
- Never commit after removing from cache

---

## 📚 Additional Resources

- **Stacks Docs**: https://docs.stacks.co
- **Testnet Explorer**: https://explorer.hiro.so/?chain=testnet
- **Testnet Faucet**: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- **Hiro Wallet**: https://wallet.hiro.so

---

## ⚡ Quick Reference

```bash
# 1. Create .env
cp .env.example .env

# 2. Add your private key to .env
# DEPLOYER_PRIVATE_KEY=your_key_here

# 3. Test setup
npx ts-node scripts/test-key-setup.ts

# 4. Get testnet STX from faucet

# 5. Deploy contracts
npx ts-node scripts/deploy-testnet.ts
```

---

**Remember**: This is for TESTNET only. Use different keys for mainnet!
