# VaultaYield Testing Guide

## Running Tests

VaultaYield includes comprehensive test coverage across all three contracts.

### Prerequisites

- Clarinet v2.0+
- Node.js v16+
- Deno (for TypeScript tests)

### Test Execution

#### 1. Check Contract Syntax

```powershell
# Verify all contracts compile without errors
clarinet check
```

Expected output:
```
✓ vault-core compiled successfully
✓ vault-token compiled successfully
✓ fee-collector compiled successfully
```

#### 2. Run Interactive Console Tests

```powershell
# Start Clarinet console
clarinet console
```

Then run manual tests:

```clarity
;; Test 1: First deposit (1:1 ratio)
(contract-call? .vault-core deposit u1000000)
;; Expected: (ok u1000000)

;; Test 2: Check user shares
(contract-call? .vault-core get-user-shares tx-sender)
;; Expected: u1000000

;; Test 3: Check share price
(contract-call? .vault-core get-share-price)
;; Expected: u1000000 (1.0 with 6 decimals)

;; Test 4: Withdraw with fee
(contract-call? .vault-core withdraw u500000)
;; Expected: (ok u497500) - 500k minus 0.5% fee

;; Test 5: Check remaining shares
(contract-call? .vault-core get-user-shares tx-sender)
;; Expected: u500000

;; Test 6: Check fee accumulation
(contract-call? .vault-core get-accumulated-fees)
;; Expected: u2500
```

#### 3. Run Clarity Test Suite

```powershell
# Run Clarity-based tests
clarinet console
```

Then load the test file:

```clarity
::load tests/vault-core_test.clar

;; Run individual tests
(test-first-deposit)
(test-withdrawal)
(test-fee-accumulation)
;; etc.
```

#### 4. Run Integration Tests with Devnet

```powershell
# Start local devnet
clarinet integrate
```

This starts a local blockchain with your contracts deployed. You can then:
- Access the web interface at `http://localhost:3000`
- Interact with contracts via browser
- Test deposit/withdrawal flows
- Monitor transactions in real-time

### Test Coverage

| Contract | Tests | Coverage Areas |
|----------|-------|----------------|
| vault-core | 23 tests | Deposits, withdrawals, fees, pause, access control |
| vault-token | 18 tests | SIP-010 compliance, mint/burn auth, transfers |
| fee-collector | 16 tests | Fee tracking, withdrawal, authorization |
| **Total** | **57 tests** | **Comprehensive** |

### Manual Test Scenarios

#### Scenario 1: Basic Deposit/Withdrawal Flow

```clarity
;; 1. Initial state check
(contract-call? .vault-core get-total-assets) ;; Should be u0
(contract-call? .vault-core get-total-shares) ;; Should be u0

;; 2. First deposit
(contract-call? .vault-core deposit u10000000) ;; 10 STX
;; Expected: (ok u10000000) - 1:1 ratio

;; 3. Verify state
(contract-call? .vault-core get-total-assets) ;; Should be u10000000
(contract-call? .vault-core get-user-shares tx-sender) ;; Should be u10000000

;; 4. Partial withdrawal
(contract-call? .vault-core withdraw u5000000) ;; Withdraw 5 shares
;; Expected: (ok u4975000) - 5M minus 0.5% fee (25k)

;; 5. Verify final state
(contract-call? .vault-core get-user-shares tx-sender) ;; Should be u5000000
(contract-call? .vault-core get-accumulated-fees) ;; Should be u25000
```

#### Scenario 2: Multi-User Testing

```clarity
;; User 1 deposits 10 STX
(as-contract 
  (contract-call? .vault-core deposit u10000000))

;; User 2 deposits 5 STX (should get 5M shares at same price)
(as-contract
  (contract-call? .vault-core deposit u5000000))

;; Verify total assets and shares
(contract-call? .vault-core get-total-assets) ;; Should be u15000000
(contract-call? .vault-core get-total-shares) ;; Should be u15000000
```

#### Scenario 3: Fee Management

```clarity
;; 1. Generate fees through withdrawals
(contract-call? .vault-core deposit u10000000)
(contract-call? .vault-core withdraw u10000000)

;; 2. Check accumulated fees
(contract-call? .vault-core get-accumulated-fees)
;; Expected: u50000 (0.5% of 10M)

;; 3. Collect fees (owner only)
(contract-call? .vault-core collect-fees tx-sender)
;; Expected: (ok u50000)

;; 4. Verify fees reset
(contract-call? .vault-core get-accumulated-fees)
;; Expected: u0
```

#### Scenario 4: Admin Functions

```clarity
;; 1. Adjust withdrawal fee to 1%
(contract-call? .vault-core set-withdrawal-fee u100)
;; Expected: (ok true)

;; 2. Verify new fee rate
(contract-call? .vault-core get-withdrawal-fee-rate)
;; Expected: u100

;; 3. Test with new fee
(contract-call? .vault-core deposit u1000000)
(contract-call? .vault-core withdraw u1000000)
;; Expected: (ok u990000) - 1M minus 1% fee (10k)
```

#### Scenario 5: Emergency Pause

```clarity
;; 1. Pause contract
(contract-call? .vault-core pause-contract)
;; Expected: (ok true)

;; 2. Try deposit (should fail)
(contract-call? .vault-core deposit u1000000)
;; Expected: (err u100) - ERR-NOT-AUTHORIZED

;; 3. Unpause
(contract-call? .vault-core unpause-contract)
;; Expected: (ok true)

;; 4. Deposit now works
(contract-call? .vault-core deposit u1000000)
;; Expected: (ok u1000000)
```

### Edge Cases to Test

1. **Zero Amount Deposits**
   ```clarity
   (contract-call? .vault-core deposit u0)
   ;; Expected: (err u102) - ERR-ZERO-AMOUNT
   ```

2. **Insufficient Balance Withdrawal**
   ```clarity
   (contract-call? .vault-core deposit u1000000)
   (contract-call? .vault-core withdraw u2000000)
   ;; Expected: (err u101) - ERR-INSUFFICIENT-BALANCE
   ```

3. **Maximum Fee Rate**
   ```clarity
   (contract-call? .vault-core set-withdrawal-fee u300)
   ;; Expected: (err u103) - ERR-INVALID-FEE-RATE (max is 200)
   ```

4. **Share Price After Rewards** (Future with PoX)
   ```clarity
   ;; Simulate rewards added to vault
   ;; Share price should increase
   ```

### Performance Testing

#### Gas Cost Analysis

Run with Clarinet to analyze gas costs:

```powershell
clarinet check
```

Expected approximate costs:
- **Deposit**: ~5,000 gas units
- **Withdraw**: ~6,500 gas units  
- **Set fee rate**: ~2,000 gas units
- **Collect fees**: ~4,000 gas units

### Debugging Tests

If a test fails:

1. **Check Error Code**
   ```clarity
   ;; Error codes reference:
   ;; u100 - ERR-NOT-AUTHORIZED
   ;; u101 - ERR-INSUFFICIENT-BALANCE
   ;; u102 - ERR-ZERO-AMOUNT
   ;; u103 - ERR-INVALID-FEE-RATE
   ;; u104 - ERR-CALCULATION-ERROR
   ;; u105 - ERR-TRANSFER-FAILED
   ```

2. **Verify State**
   ```clarity
   (contract-call? .vault-core get-total-assets)
   (contract-call? .vault-core get-total-shares)
   (contract-call? .vault-core is-paused)
   ```

3. **Check Authorization**
   ```clarity
   (contract-call? .vault-core get-contract-owner)
   ;; Verify tx-sender matches
   ```

### Continuous Integration

For automated testing in CI/CD:

```powershell
# In your CI pipeline
clarinet check
# Run integration tests
clarinet integrate --no-dashboard
```

### Test Reporting

Track test results:
- ✅ All syntax checks pass
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All edge cases handled
- ✅ Gas costs within limits

---

## Next Steps

After all tests pass:
1. Review test coverage report
2. Conduct security audit
3. Deploy to testnet
4. Run tests on testnet
5. Monitor for issues
6. Prepare for mainnet

---

*Testing Guide - VaultaYield v1.0*
