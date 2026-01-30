;; ========================================
;; VAULTAYIELD - HARVEST MANAGER
;; ========================================
;; Detects and claims BTC rewards from completed stacking cycles
;; Tracks reward history and triggers compounding

;; ========================================
;; CONSTANTS
;; ========================================

(define-constant CONTRACT-OWNER tx-sender)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ZERO-AMOUNT (err u101))
(define-constant ERR-CYCLE-NOT-FOUND (err u102))
(define-constant ERR-CYCLE-ALREADY-HARVESTED (err u103))
(define-constant ERR-TOO-SOON (err u104))
(define-constant ERR-NO-PENDING-REWARDS (err u105))

;; Harvest timing
(define-constant DEFAULT-HARVEST-INTERVAL u144) ;; ~1 day in blocks (10 min blocks)
(define-constant MIN-HARVEST-INTERVAL u10) ;; Minimum 10 blocks between harvests

;; ========================================
;; DATA VARIABLES
;; ========================================

;; Total BTC rewards harvested (in satoshis)
(define-data-var total-btc-harvested uint u0)

;; Last harvested cycle
(define-data-var last-harvest-cycle uint u0)

;; Harvest frequency control
(define-data-var harvest-interval uint DEFAULT-HARVEST-INTERVAL)
(define-data-var last-harvest-height uint u0)

;; Authorized contracts
(define-data-var stacking-strategy-contract (optional principal) none)
(define-data-var compound-engine-contract (optional principal) none)

;; ========================================
;; DATA MAPS
;; ========================================

;; Track rewards per cycle: cycle-id => btc-amount (sats)
(define-map cycle-rewards uint uint)

;; Track if cycle has been harvested
(define-map cycle-harvested uint bool)

;; ========================================
;; READ-ONLY FUNCTIONS
;; ========================================

(define-read-only (get-cycle-rewards (cycle-id uint))
  ;; Return BTC earned in specific cycle
  ;; Returns u0 if cycle not harvested yet
  (default-to u0 (map-get? cycle-rewards cycle-id))
)

(define-read-only (is-cycle-harvested (cycle-id uint))
  ;; Check if cycle has been harvested
  (default-to false (map-get? cycle-harvested cycle-id))
)

(define-read-only (get-total-btc-harvested)
  ;; Return total BTC harvested across all cycles
  (var-get total-btc-harvested)
)

(define-read-only (get-last-harvest-cycle)
  ;; Return most recently harvested cycle
  (var-get last-harvest-cycle)
)

(define-read-only (get-harvest-interval)
  ;; Return current harvest interval in blocks
  (var-get harvest-interval)
)

(define-read-only (blocks-until-next-harvest)
  ;; Calculate blocks remaining until next harvest allowed
  (let
    (
      (last-harvest (var-get last-harvest-height))
      (interval (var-get harvest-interval))
      (current-height block-height)
      (next-allowed (+ last-harvest interval))
    )
    (if (>= current-height next-allowed)
      u0
      (- next-allowed current-height)
    )
  )
)

;; ========================================
;; PRIVATE FUNCTIONS
;; ========================================

(define-private (can-harvest-now)
  ;; Check if enough time has passed since last harvest
  (let
    (
      (last-harvest (var-get last-harvest-height))
      (interval (var-get harvest-interval))
    )
    (>= (- block-height last-harvest) interval)
  )
)

;; ========================================
;; PUBLIC FUNCTIONS - Placeholder Stubs
;; ========================================

(define-public (harvest-rewards)
  ;; TODO: Implement harvest logic
  ;; Will check for completed cycles and record rewards
  (ok true)
)

(define-public (manual-record-reward (cycle-id uint) (btc-amount uint))
  ;; TODO: Implement manual reward recording
  ;; Admin fallback for manual entry
  (ok true)
)

(define-public (get-pending-rewards)
  ;; TODO: Implement pending rewards calculation
  ;; Calculate unharvested rewards
  (ok u0)
)

;; ========================================
;; ADMIN FUNCTIONS
;; ========================================

(define-public (set-stacking-strategy (strategy-contract principal))
  ;; Set authorized stacking-strategy contract
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set stacking-strategy-contract (some strategy-contract))
    (ok true)
  )
)

(define-public (set-compound-engine (compound-contract principal))
  ;; Set authorized compound-engine contract
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set compound-engine-contract (some compound-contract))
    (ok true)
  )
)

(define-public (set-harvest-interval (new-interval uint))
  ;; Update harvest interval
  ;; Prevent too-frequent harvesting
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (>= new-interval MIN-HARVEST-INTERVAL) ERR-ZERO-AMOUNT)
    (var-set harvest-interval new-interval)
    (ok true)
  )
)
