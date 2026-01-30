# VaultaYield Testnet Deployment Guide

## Prerequisites

1. **Get Testnet STX**
   - Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
   - Request testnet STX tokens
   - You'll need at least 2 STX for deployment fees

2. **Setup Environment**
   ```bash
   npm install
   ```

3. **Configure Private Key**
   ```bash
   # Set your testnet private key
   export DEPLOYER_PRIVATE_KEY="your_64_character_hex_private_key"
   ```

## Deployment Process

### Step 1: Deploy Contracts

```bash
# Run deployment script
npx ts-node scripts/deploy-testnet.ts
```

The script will deploy contracts in this order:
1. `vault-token` (SIP-010 token)
2. `fee-collector` (Fee management)
3. `stacking-strategy` (PoX integration)
4. `harvest-manager` (Reward tracking)
5. `compound-engine` (BTC→STX conversion)
6. `vault-core` (Main vault logic)

Each deployment will:
- Upload contract to testnet
- Wait for confirmation
- Display transaction ID
- Provide explorer link

### Step 2: Post-Deployment Configuration

After all contracts are deployed, configure vault-core:

```clarity
;; 1. Set stacking-strategy contract
(contract-call? .vault-core set-stacking-strategy .stacking-strategy)

;; 2. Set harvest-manager contract
(contract-call? .vault-core set-harvest-manager .harvest-manager)

;; 3. Set compound-engine contract
(contract-call? .vault-core set-compound-engine .compound-engine)

;; 4. Enable stacking functionality
(contract-call? .vault-core enable-stacking true)

;; 5. (Optional) Adjust stacking threshold
(contract-call? .vault-core set-stacking-threshold u200000000000000) ;; 200K STX
```

### Step 3: Verify Deployment

1. Check each contract on explorer
2. Verify contract source matches local files
3. Confirm all configurations are set

## Testing on Testnet

### Test 1: Basic Deposit

```clarity
;; Deposit 100 STX to vault
(contract-call? .vault-core deposit u100000000)
```

### Test 2: Deposit with Stacking

```clarity
;; Deposit 150K STX with auto-stacking (3 cycles)
(contract-call? .vault-core deposit-with-stacking u150000000000000 u3)
```

### Test 3: Manual Reward Recording

```clarity
;; Simulate receiving 0.5 BTC rewards for cycle 100
(contract-call? .harvest-manager manual-record-reward u100 u50000000)
```

### Test 4: Execute Compound

```clarity
;; Compound 0.5 BTC to STX (mock DEX)
(contract-call? .compound-engine execute-compound-mock u50000000)
;; or with slippage protection
(contract-call? .compound-engine execute-compound u50000000 u50000000 u47500000)
```

### Test 5: Verify Share Price

```clarity
;; Check share price (should increase after compound)
(contract-call? .vault-core get-share-price)
```

## Troubleshooting

### Contract Deployment Fails

- **Insufficient STX**: Get more from faucet
- **Nonce Error**: Clear nonce and retry
- **Contract too large**: Optimize or split contract

### Configuration Issues

- **Not owner**: Ensure deployer address is calling
- **Contract not found**: Verify contract name matches deployment

### Transaction Stuck

- View transaction on explorer
- Check mempool status
- May need to wait longer for confirmation

## Important Notes

⚠️ **Phase 2 Limitations:**
- Mock DEX integration (not real swaps)
- No actual PoX stacking yet (Phase 3)
- Manual reward recording required

✅ **What Works:**
- Deposit and share minting
- deposit-with-stacking flows
- Mock compound operations
- Fee calculations
- Admin configuration

## Next Steps

After successful testnet deployment:

1. Test all major functions
2. Document actual TxIDs and results
3. Monitor for any on-chain issues
4. Prepare for Phase 3 (real PoX integration)

## Support Resources

- **Stacks Explorer**: https://explorer.hiro.so/?chain=testnet
- **API Docs**: https://docs.hiro.so/api
- **Clarity Lang**: https://docs.stacks.co/clarity/

---

**Deployment Date**: TBD  
**Network**: Stacks Testnet  
**Status**: Ready for deployment
