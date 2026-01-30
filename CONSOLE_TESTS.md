# VaultaYield Console Testing Guide

## Quick Console Test

### Start Console
```powershell
clarinet console
```

### Test Sequence

#### 1. Check Initial State
```clarity
;; Check total assets (should be 0)
(contract-call? .vault-core get-total-assets)
;; Expected: u0

;; Check total shares (should be 0)
(contract-call? .vault-core get-total-shares)
;; Expected: u0

;; Check share price (should be 1.0 = 1000000)
(contract-call? .vault-core get-share-price)
;; Expected: u1000000
```

#### 2. First Deposit Test
```clarity
;; Deposit 1 STX (1,000,000 micro-STX)
(contract-call? .vault-core deposit u1000000)
;; Expected: (ok u1000000) - received 1M shares

;; Check your shares
(contract-call? .vault-core get-user-shares tx-sender)
;; Expected: u1000000

;; Check total assets
(contract-call? .vault-core get-total-assets)
;; Expected: u1000000
```

#### 3. Second Deposit Test
```clarity
;; Deposit another 500,000 micro-STX
(contract-call? .vault-core deposit u500000)
;; Expected: (ok u500000) - received 500k shares

;; Check total shares
(contract-call? .vault-core get-user-shares tx-sender)
;; Expected: u1500000

;; Verify share price still 1:1
(contract-call? .vault-core get-share-price)
;; Expected: u1000000
```

#### 4. Withdrawal Test
```clarity
;; Withdraw 500,000 shares
(contract-call? .vault-core withdraw u500000)
;; Expected: (ok u497500) - 500k minus 0.5% fee = 497,500

;; Check remaining shares
(contract-call? .vault-core get-user-shares tx-sender)
;; Expected: u1000000

;; Check accumulated fees
(contract-call? .vault-core get-accumulated-fees)
;; Expected: u2500 (0.5% of 500k)
```

#### 5. Fee Management Test
```clarity
;; Collect accumulated fees (deployer only)
(contract-call? .vault-core collect-fees tx-sender)
;; Expected: (ok u2500)

;; Verify fees reset
(contract-call? .vault-core get-accumulated-fees)
;; Expected: u0
```

#### 6. Admin Functions Test
```clarity
;; Change withdrawal fee to 1% (100 basis points)
(contract-call? .vault-core set-withdrawal-fee u100)
;; Expected: (ok true)

;; Verify new fee rate
(contract-call? .vault-core get-withdrawal-fee-rate)
;; Expected: u100

;; Test withdrawal with new fee
(contract-call? .vault-core deposit u1000000)
(contract-call? .vault-core withdraw u1000000)
;; Expected: (ok u990000) - 1M minus 1% = 990k
```

#### 7. Pause Mechanism Test
```clarity
;; Pause contract
(contract-call? .vault-core pause-contract)
;; Expected: (ok true)

;; Try to deposit (should fail)
(contract-call? .vault-core deposit u100000)
;; Expected: (err u100) - ERR-NOT-AUTHORIZED

;; Unpause
(contract-call? .vault-core unpause-contract)
;; Expected: (ok true)

;; Deposit now works
(contract-call? .vault-core deposit u100000)
;; Expected: (ok ...)
```

#### 8. Edge Case Tests
```clarity
;; Try zero deposit
(contract-call? .vault-core deposit u0)
;; Expected: (err u102) - ERR-ZERO-AMOUNT

;; Try to withdraw more than balance
(contract-call? .vault-core withdraw u99999999999)
;; Expected: (err u101) - ERR-INSUFFICIENT-BALANCE

;; Try to set excessive fee rate
(contract-call? .vault-core set-withdrawal-fee u500)
;; Expected: (err u103) - ERR-INVALID-FEE-RATE (max is 200)
```

## Expected Results Summary

| Test | Command | Expected Result |
|------|---------|-----------------|
| Initial assets | `get-total-assets` | `u0` |
| Initial shares | `get-total-shares` | `u0` |
| Share price | `get-share-price` | `u1000000` |
| First deposit | `deposit u1000000` | `(ok u1000000)` |
| Check shares | `get-user-shares` | `u1000000` |
| Withdrawal | `withdraw u500000` | `(ok u497500)` |
| Fee collection | `collect-fees` | `(ok u2500)` |
| Zero deposit | `deposit u0` | `(err u102)` |
| Excessive fee | `set-withdrawal-fee u500` | `(err u103)` |

## Troubleshooting

### Issue: Contract not found
**Solution**: Make sure you're in the project root directory and contracts are compiled

### Issue: Insufficient balance error
**Solution**: The test accounts start with 100,000,000 STX each

### Issue: Permission denied
**Solution**: Some functions (like `collect-fees`) are deployer-only. Make sure you're using the deployer account

### Issue: Console won't start
**Solution**: Ensure Simnet.toml exists in settings/ directory

## Exit Console
```clarity
::quit
```
or press `Ctrl+C`

---

*VaultaYield Console Testing - Quick Reference*
