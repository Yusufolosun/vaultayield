# VaultaYield Deployment Guide

## Prerequisites

Before deploying VaultaYield contracts, ensure you have:

- ✅ Clarinet installed (v1.5.4+)
- ✅ Stacks CLI installed
- ✅ Wallet with sufficient STX for deployment fees
- ✅ Access to target network (Testnet or Mainnet)

## Deployment Order

Contracts must be deployed in this specific order due to dependencies:

```
1. vault-token.clar
   ↓
2. fee-collector.clar
   ↓
3. vault-core.clar
   ↓
4. Post-deployment configuration
```

## Step-by-Step Deployment

### 1. Deploy to Devnet (Local Testing)

```powershell
# Start local devnet
clarinet integrate

# In another terminal, deploy contracts
clarinet deployments apply -p deployments/devnet.yaml
```

### 2. Deploy to Testnet

#### Generate Deployment Plan

```powershell
# Generate testnet deployment plan
clarinet deployments generate --testnet
```

This creates `deployments/default.testnet-plan.yaml`

#### Configure Deployment

Edit the generated plan or create `deployments/testnet.yaml`:

```yaml
---
id: 0
name: VaultaYield Testnet Deployment
network: testnet
stacks-node: https://stacks-node-api.testnet.stacks.co
bitcoin-node: http://blockstack:blockstacksystem@bitcoin.testnet.stacks.co:18332
plan:
  batches:
    - id: 0
      transactions:
        - contract-publish:
            contract-name: vault-token
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
            cost: 2650
            path: contracts/vault-token.clar
            anchor-block-only: true
    - id: 1
      transactions:
        - contract-publish:
            contract-name: fee-collector
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
            cost: 2450
            path: contracts/fee-collector.clar
            anchor-block-only: true
    - id: 2
      transactions:
        - contract-publish:
            contract-name: vault-core
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
            cost: 6850
            path: contracts/vault-core.clar
            anchor-block-only: true
```

#### Execute Deployment

```powershell
# Deploy to testnet
clarinet deployments apply -p deployments/testnet.yaml --testnet
```

### 3. Post-Deployment Configuration

After all contracts are deployed, configure contract relationships:

#### Using Clarinet Console

```powershell
clarinet console --testnet
```

```clarity
;; Get deployed contract addresses
::get_contracts_info

;; Set vault-core address in vault-token
;; Replace with actual deployed address
(contract-call? .vault-token set-vault-core 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-core)

;; Set vault-core address in fee-collector
(contract-call? .fee-collector set-vault-core 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-core)

;; Verify configuration
(contract-call? .vault-core get-contract-owner)
```

#### Using Stacks CLI

```powershell
# Set vault-core in vault-token
stx deploy_contract vault-token contracts/vault-token.clar --testnet

# After deployment, call set-vault-core
stx call_contract_func \
  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM \
  vault-token \
  set-vault-core \
  -a ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-core \
  --testnet
```

### 4. Deploy to Mainnet

> **⚠️ WARNING**: Only deploy to mainnet after thorough testing and security audits!

#### Create Mainnet Deployment Plan

```yaml
---
id: 0
name: VaultaYield Mainnet Deployment
network: mainnet
stacks-node: https://stacks-node-api.mainnet.stacks.co
plan:
  batches:
    - id: 0
      transactions:
        - contract-publish:
            contract-name: vault-token
            expected-sender: SP2XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
            cost: 2650
            path: contracts/vault-token.clar
            anchor-block-only: true
    - id: 1
      transactions:
        - contract-publish:
            contract-name: fee-collector
            expected-sender: SP2XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
            cost: 2450
            path: contracts/fee-collector.clar
            anchor-block-only: true
    - id: 2
      transactions:
        - contract-publish:
            contract-name: vault-core
            expected-sender: SP2XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
            cost: 6850
            path: contracts/vault-core.clar
            anchor-block-only: true
```

#### Execute Mainnet Deployment

```powershell
# Deploy to mainnet (requires funded wallet)
clarinet deployments apply -p deployments/mainnet.yaml --mainnet

# Confirm each transaction before broadcasting
# Review gas costs and contract code carefully
```

## Verification Steps

### 1. Verify Contract Deployment

```powershell
# Check contract is deployed on explorer
# Testnet: https://explorer.stacks.co/?chain=testnet
# Mainnet: https://explorer.stacks.co/

# Or use CLI
stx get_contract_info ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM vault-core --testnet
```

### 2. Verify Configuration

```clarity
;; Check vault-core is set correctly
(contract-call? .vault-token get-token-uri)
(contract-call? .fee-collector get-accumulated-fees)
(contract-call? .vault-core get-total-assets)
```

### 3. Test Basic Operations

```clarity
;; Test deposit (use small amount first!)
(contract-call? .vault-core deposit u1000000) ;; 1 STX

;; Check shares received
(contract-call? .vault-core get-user-shares tx-sender)

;; Test withdrawal
(contract-call? .vault-core withdraw u500000) ;; 0.5 shares
```

## Deployment Costs (Estimated)

| Contract | Size | Estimated Cost (Testnet) | Estimated Cost (Mainnet) |
|----------|------|--------------------------|--------------------------|
| vault-token | ~119 lines | ~2,650 STX | ~0.05 STX |
| fee-collector | ~109 lines | ~2,450 STX | ~0.045 STX |
| vault-core | ~300 lines | ~6,850 STX | ~0.12 STX |
| **Total** | **528 lines** | **~11,950 STX** | **~0.215 STX** |

> **Note**: Testnet uses faucet STX. Mainnet costs are approximate and vary with network conditions.

## Security Checklist

Before mainnet deployment:

- [ ] **Code Audit**: Professional security audit completed
- [ ] **Test Coverage**: All tests passing (57/57)
- [ ] **Testnet Testing**: Deployed and tested on testnet
- [ ] **Integration Tests**: Frontend integration verified
- [ ] **Economic Analysis**: Fee structure validated
- [ ] **Edge Cases**: All edge cases tested
- [ ] **Access Control**: Owner keys secured (hardware wallet recommended)
- [ ] **Emergency Plan**: Pause mechanism tested, recovery plan documented
- [ ] **Documentation**: All functions documented
- [ ] **Monitoring**: Analytics and monitoring setup ready

## Post-Deployment Tasks

### 1. Update Frontend Configuration

```javascript
// Update contract addresses in frontend
const CONTRACTS = {
  vaultCore: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-core',
  vaultToken: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.vault-token',
  feeCollector: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.fee-collector'
};
```

### 2. Set Token URI

```clarity
;; Update token metadata URI
(contract-call? .vault-token set-token-uri 
  (some u"https://vaultayield.io/api/token-metadata.json"))
```

### 3. Configure Initial Fee Rate (Optional)

```clarity
;; Update from default 0.5% if needed
(contract-call? .vault-core set-withdrawal-fee u100) ;; 1%
```

### 4. Monitor Contract Activity

- Set up event monitoring for deposits/withdrawals
- Track fee accumulation
- Monitor share price changes
- Alert on unusual activity

## Rollback Plan

If issues are discovered post-deployment:

1. **Pause Contract**: `(contract-call? .vault-core pause-contract)`
2. **Assess Issue**: Review transaction history, check for exploits
3. **Communication**: Notify users via official channels
4. **Fix Strategy**: 
   - If fixable: Deploy new version, migrate users
   - If critical: Plan for user fund recovery
5. **Resume**: Only after thorough testing of fix

## Support & Resources

- **Stacks Explorer**: https://explorer.stacks.co/
- **Stacks Docs**: https://docs.stacks.co/
- **Clarinet Docs**: https://docs.hiro.so/clarinet/
- **Stacks Discord**: https://discord.gg/stacks

## Troubleshooting

### Issue: Contract deployment fails

**Solution**: 
- Check account has sufficient STX balance
- Verify network connectivity
- Ensure contract name is unique

### Issue: Configuration calls fail

**Solution**:
- Verify you're calling from deployer account (CONTRACT-OWNER)
- Check contract addresses are correct
- Ensure contracts deployed in correct order

### Issue: Test operations fail

**Solution**:
- Check contract is not paused
- Verify user has sufficient STX balance
- Review transaction error messages in explorer

---

**Deployment Checklist Complete!** ✅

For production deployment, always follow the security checklist and conduct thorough testing on testnet first.
