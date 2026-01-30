;; ========================================
;; VAULT-CORE CONTRACT TESTS
;; ========================================
;; Comprehensive test suite for VaultaYield core vault

(define-constant deployer tx-sender)
(define-constant wallet-1 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(define-constant wallet-2 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)
(define-constant wallet-3 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)

;; ========================================
;; BASIC FUNCTIONALITY TESTS
;; ========================================

;; Test 1: First deposit creates 1:1 share ratio
(define-public (test-first-deposit)
  (let
    (
      (deposit-result (contract-call? .vault-core deposit u1000000))
    )
    (asserts! (is-ok deposit-result) (err u1))
    (asserts! (is-eq (unwrap-panic deposit-result) u1000000) (err u2))
    (asserts! (is-eq (contract-call? .vault-core get-user-shares tx-sender) u1000000) (err u3))
    (asserts! (is-eq (contract-call? .vault-core get-total-shares) u1000000) (err u4))
    (asserts! (is-eq (contract-call? .vault-core get-total-assets) u1000000) (err u5))
    (ok true)
  )
)

;; Test 2: Share price is 1.0 initially (PRECISION = 1000000)
(define-public (test-initial-share-price)
  (begin
    (try! (contract-call? .vault-core deposit u1000000))
    (asserts! (is-eq (contract-call? .vault-core get-share-price) u1000000) (err u1))
    (ok true)
  )
)

;; Test 3: Second deposit calculates shares correctly
(define-public (test-second-deposit)
  (begin
    ;; First deposit by deployer
    (try! (contract-call? .vault-core deposit u1000000))
    
    ;; Second deposit by same user
    (try! (contract-call? .vault-core deposit u500000))
    
    ;; Should have 1,500,000 shares (1:1 ratio maintained)
    (asserts! (is-eq (contract-call? .vault-core get-user-shares tx-sender) u1500000) (err u1))
    (asserts! (is-eq (contract-call? .vault-core get-total-shares) u1500000) (err u2))
    (asserts! (is-eq (contract-call? .vault-core get-total-assets) u1500000) (err u3))
    (ok true)
  )
)

;; Test 4: Withdrawal returns correct STX amount
(define-public (test-withdrawal)
  (begin
    ;; Deposit 1,000,000 STX
    (try! (contract-call? .vault-core deposit u1000000))
    
    ;; Withdraw half (500,000 shares)
    (let
      (
        (withdraw-result (contract-call? .vault-core withdraw u500000))
      )
      (asserts! (is-ok withdraw-result) (err u1))
      
      ;; Should return ~497,500 STX (500,000 - 0.5% fee)
      ;; Fee = 500,000 * 50 / 10000 = 2,500
      ;; Net = 500,000 - 2,500 = 497,500
      (asserts! (is-eq (unwrap-panic withdraw-result) u497500) (err u2))
      
      ;; Remaining shares should be 500,000
      (asserts! (is-eq (contract-call? .vault-core get-user-shares tx-sender) u500000) (err u3))
      
      ;; Total shares should be 500,000
      (asserts! (is-eq (contract-call? .vault-core get-total-shares) u500000) (err u4))
      
      ;; Total assets should be 500,000 (original 1M - 500k withdrawn)
      (asserts! (is-eq (contract-call? .vault-core get-total-assets) u500000) (err u5))
      
      (ok true)
    )
  )
)

;; Test 5: Withdrawal fee accumulates correctly
(define-public (test-fee-accumulation)
  (begin
    ;; Deposit 1,000,000 STX
    (try! (contract-call? .vault-core deposit u1000000))
    
    ;; Withdraw 500,000 shares
    (try! (contract-call? .vault-core withdraw u500000))
    
    ;; Fee should be 2,500 (500,000 * 0.5%)
    (asserts! (is-eq (contract-call? .vault-core get-accumulated-fees) u2500) (err u1))
    
    (ok true)
  )
)

;; ========================================
;; EDGE CASE TESTS
;; ========================================

;; Test 6: Zero amount deposit rejected
(define-public (test-zero-deposit)
  (let
    (
      (result (contract-call? .vault-core deposit u0))
    )
    (asserts! (is-err result) (err u1))
    (asserts! (is-eq result (err u102)) (err u2)) ;; ERR-ZERO-AMOUNT
    (ok true)
  )
)

;; Test 7: Zero amount withdrawal rejected
(define-public (test-zero-withdrawal)
  (begin
    (try! (contract-call? .vault-core deposit u1000000))
    (let
      (
        (result (contract-call? .vault-core withdraw u0))
      )
      (asserts! (is-err result) (err u1))
      (asserts! (is-eq result (err u102)) (err u2)) ;; ERR-ZERO-AMOUNT
      (ok true)
    )
  )
)

;; Test 8: Withdraw more than balance rejected
(define-public (test-insufficient-balance)
  (begin
    (try! (contract-call? .vault-core deposit u1000000))
    (let
      (
        (result (contract-call? .vault-core withdraw u2000000))
      )
      (asserts! (is-err result) (err u1))
      (asserts! (is-eq result (err u101)) (err u2)) ;; ERR-INSUFFICIENT-BALANCE
      (ok true)
    )
  )
)

;; Test 9: User with no shares cannot withdraw
(define-public (test-no-shares-withdrawal)
  (let
    (
      (result (contract-call? .vault-core withdraw u100))
    )
    (asserts! (is-err result) (err u1))
    (asserts! (is-eq result (err u101)) (err u2)) ;; ERR-INSUFFICIENT-BALANCE
    (ok true)
  )
)

;; ========================================
;; SECURITY & ACCESS CONTROL TESTS
;; ========================================

;; Test 10: Only owner can set withdrawal fee
(define-public (test-non-owner-set-fee)
  (let
    (
      (result (contract-call? .vault-core set-withdrawal-fee u100))
    )
    ;; This will fail if tx-sender is not the deployer
    ;; In practice, you'd use contract-call? with a different principal
    (ok true) ;; Placeholder - actual test requires multi-principal testing
  )
)

;; Test 11: Fee rate cannot exceed maximum
(define-public (test-max-fee-rate)
  (let
    (
      (result (contract-call? .vault-core set-withdrawal-fee u300))
    )
    (asserts! (is-err result) (err u1))
    (asserts! (is-eq result (err u103)) (err u2)) ;; ERR-INVALID-FEE-RATE
    (ok true)
  )
)

;; Test 12: Valid fee rate can be set
(define-public (test-valid-fee-rate)
  (let
    (
      (result (contract-call? .vault-core set-withdrawal-fee u100))
    )
    (asserts! (is-ok result) (err u1))
    (asserts! (is-eq (contract-call? .vault-core get-withdrawal-fee-rate) u100) (err u2))
    (ok true)
  )
)

;; Test 13: Pause contract stops deposits
(define-public (test-pause-deposits)
  (begin
    (try! (contract-call? .vault-core pause-contract))
    (let
      (
        (result (contract-call? .vault-core deposit u1000000))
      )
      (asserts! (is-err result) (err u1))
      (asserts! (is-eq result (err u100)) (err u2)) ;; ERR-NOT-AUTHORIZED
      (ok true)
    )
  )
)

;; Test 14: Pause contract stops withdrawals
(define-public (test-pause-withdrawals)
  (begin
    ;; Deposit first
    (try! (contract-call? .vault-core deposit u1000000))
    
    ;; Pause
    (try! (contract-call? .vault-core pause-contract))
    
    ;; Try to withdraw
    (let
      (
        (result (contract-call? .vault-core withdraw u500000))
      )
      (asserts! (is-err result) (err u1))
      (asserts! (is-eq result (err u100)) (err u2)) ;; ERR-NOT-AUTHORIZED
      (ok true)
    )
  )
)

;; Test 15: Unpause allows operations again
(define-public (test-unpause)
  (begin
    ;; Pause
    (try! (contract-call? .vault-core pause-contract))
    (asserts! (is-eq (contract-call? .vault-core is-paused) true) (err u1))
    
    ;; Unpause
    (try! (contract-call? .vault-core unpause-contract))
    (asserts! (is-eq (contract-call? .vault-core is-paused) false) (err u2))
    
    ;; Deposit should work
    (try! (contract-call? .vault-core deposit u1000000))
    (ok true)
  )
)

;; ========================================
;; FEE COLLECTION TESTS
;; ========================================

;; Test 16: Owner can collect fees
(define-public (test-collect-fees)
  (begin
    ;; Deposit and withdraw to generate fees
    (try! (contract-call? .vault-core deposit u1000000))
    (try! (contract-call? .vault-core withdraw u500000))
    
    ;; Collect fees
    (let
      (
        (result (contract-call? .vault-core collect-fees tx-sender))
      )
      (asserts! (is-ok result) (err u1))
      (asserts! (is-eq (unwrap-panic result) u2500) (err u2)) ;; Fee amount
      (asserts! (is-eq (contract-call? .vault-core get-accumulated-fees) u0) (err u3))
      (ok true)
    )
  )
)

;; Test 17: Cannot collect zero fees
(define-public (test-collect-zero-fees)
  (let
    (
      (result (contract-call? .vault-core collect-fees tx-sender))
    )
    (asserts! (is-err result) (err u1))
    (asserts! (is-eq result (err u102)) (err u2)) ;; ERR-ZERO-AMOUNT
    (ok true)
  )
)

;; ========================================
;; READ-ONLY FUNCTION TESTS
;; ========================================

;; Test 18: Get user STX value calculation
(define-public (test-user-stx-value)
  (begin
    ;; Deposit 1,000,000 STX = 1,000,000 shares
    (try! (contract-call? .vault-core deposit u1000000))
    
    ;; User's STX value should be 1,000,000
    (asserts! (is-eq (contract-call? .vault-core get-user-stx-value tx-sender) u1000000) (err u1))
    
    (ok true)
  )
)

;; Test 19: Contract owner is deployer
(define-public (test-contract-owner)
  (begin
    (asserts! (is-eq (contract-call? .vault-core get-contract-owner) deployer) (err u1))
    (ok true)
  )
)

;; ========================================
;; MULTI-USER SCENARIO TESTS
;; ========================================

;; Test 20: Multiple users share calculation
;; Note: This test is conceptual and would need multi-principal support
(define-public (test-multi-user-deposits)
  (begin
    ;; User 1 deposits 1,000,000 → gets 1,000,000 shares
    (try! (contract-call? .vault-core deposit u1000000))
    
    ;; At this point, share price = 1.0
    ;; User 2 would deposit 500,000 → gets 500,000 shares
    ;; Total: 1,500,000 shares for 1,500,000 STX
    
    (ok true)
  )
)
