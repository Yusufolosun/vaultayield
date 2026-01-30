;; ========================================
;; VAULTAYIELD - COMPOUND ENGINE
;; ========================================
;; Converts BTC rewards to STX and reinvests into stacking
;; Manages DEX integration and share price updates

;; ========================================
;; CONSTANTS
;; ========================================

(define-constant CONTRACT-OWNER tx-sender)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ZERO-AMOUNT (err u101))
(define-constant ERR-SLIPPAGE-EXCEEDED (err u102))
(define-constant ERR-DEX-NOT-SET (err u103))
(define-constant ERR-INVALID-SWAP (err u104))
(define-constant ERR-HARVEST-REQUIRED (err u105))

;; Default configurations
(define-constant DEFAULT-SLIPPAGE-TOLERANCE u50) ;; 0.5% (in basis points: 50/10000)
(define-constant MAX-SLIPPAGE u500) ;; 5% maximum
(define-constant PERFORMANCE-FEE-BPS u200) ;; 2% performance fee (200/10000)
(define-constant BASIS_POINTS u10000)

;; ========================================
;; DATA VARIABLES
;; ========================================

;; DEX contract for BTC→STX swaps
(define-data-var dex-contract (optional principal) none)

;; Slippage protection
(define-data-var slippage-tolerance uint DEFAULT-SLIPPAGE-TOLERANCE)

;; Performance tracking
(define-data-var total-compounded-stx uint u0)
(define-data-var total-compounds uint u0)
(define-data-var last-compound-height uint u0)

;; Contract references
(define-data-var harvest-manager-contract (optional principal) none)
(define-data-var vault-core-contract (optional principal) none)

;; Mock DEX mode (for testing without real DEX)
(define-data-var mock-dex-mode bool true)
(define-data-var mock-exchange-rate uint u50000) ;; 1 BTC = 50,000 STX (in micro units)

;; ========================================
;; DATA MAPS
;; ========================================

;; Track compound history: compound-id => details
(define-map compound-history
  uint
  {
    btc-amount: uint,
    stx-received: uint,
    fee-amount: uint,
    block-height: uint
  }
)

;; ========================================
;; READ-ONLY FUNCTIONS
;; ========================================

(define-read-only (get-total-compounded-stx)
  ;; Return total STX compounded across all operations
  (var-get total-compounded-stx)
)

(define-read-only (get-total-compounds)
  ;; Return number of compound operations executed
  (var-get total-compounds)
)

(define-read-only (get-slippage-tolerance)
  ;; Return current slippage tolerance in basis points
  (var-get slippage-tolerance)
)

(define-read-only (get-dex-contract)
  ;; Return configured DEX contract
  (var-get dex-contract)
)

(define-read-only (get-compound-history (compound-id uint))
  ;; Get details of specific compound operation
  (map-get? compound-history compound-id)
)

(define-read-only (calculate-compound-impact (btc-amount uint))
  ;; Estimate STX received and fees for BTC amount
  ;; Uses mock rate or queries DEX
  (let
    (
      (exchange-rate (var-get mock-exchange-rate))
      (gross-stx (/ (* btc-amount exchange-rate) u100000000)) ;; Convert BTC sats to STX
      (performance-fee (/ (* gross-stx PERFORMANCE-FEE-BPS) BASIS_POINTS))
      (net-stx (- gross-stx performance-fee))
    )
    (ok {
      gross-stx: gross-stx,
      performance-fee: performance-fee,
      net-stx: net-stx
    })
  )
)

;; ========================================
;; PRIVATE FUNCTIONS
;; ========================================

(define-private (calculate-performance-fee (stx-amount uint))
  ;; Calculate 2% performance fee on STX received
  (/ (* stx-amount PERFORMANCE-FEE-BPS) BASIS_POINTS)
)

(define-private (check-slippage (expected-stx uint) (actual-stx uint))
  ;; Verify actual STX received is within slippage tolerance
  (let
    (
      (tolerance (var-get slippage-tolerance))
      (min-acceptable (- expected-stx (/ (* expected-stx tolerance) BASIS_POINTS)))
    )
    (>= actual-stx min-acceptable)
  )
)

;; ========================================
;; PUBLIC FUNCTIONS - Placeholder Stubs
;; ========================================

(define-public (execute-compound (btc-amount uint))
  ;; TODO: Implement compound execution
  ;; Will swap BTC for STX and re-stake
  (ok true)
)

(define-public (execute-compound-mock (btc-amount uint))
  ;; TODO: Implement mock compound for testing
  ;; Simulates DEX swap without actual DEX
  (ok true)
)

;; ========================================
;; ADMIN FUNCTIONS
;; ========================================

(define-public (set-dex-contract (dex principal))
  ;; Set authorized DEX contract for swaps
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set dex-contract (some dex))
    (var-set mock-dex-mode false)
    (ok true)
  )
)

(define-public (set-slippage-tolerance (new-tolerance uint))
  ;; Update slippage tolerance (max 5%)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (<= new-tolerance MAX-SLIPPAGE) ERR-SLIPPAGE-EXCEEDED)
    (var-set slippage-tolerance new-tolerance)
    (ok true)
  )
)

(define-public (set-harvest-manager (manager principal))
  ;; Set authorized harvest-manager contract
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set harvest-manager-contract (some manager))
    (ok true)
  )
)

(define-public (set-vault-core (vault principal))
  ;; Set authorized vault-core contract
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set vault-core-contract (some vault))
    (ok true)
  )
)

(define-public (set-mock-exchange-rate (rate uint))
  ;; Update mock exchange rate for testing
  ;; Rate format: 1 BTC (100M sats) = rate STX
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> rate u0) ERR-ZERO-AMOUNT)
    (var-set mock-exchange-rate rate)
    (ok true)
  )
)

(define-public (enable-mock-dex-mode)
  ;; Enable mock DEX for testing (no real DEX required)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set mock-dex-mode true)
    (ok true)
  )
)
