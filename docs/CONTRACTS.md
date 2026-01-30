# Smart Contract Documentation

## Table of Contents
1. [vault-core.clar](#vault-coreclar)
2. [vault-token.clar](#vault-tokenclar)
3. [fee-collector.clar](#fee-collectorclar)

---

## vault-core.clar

Main vault contract handling deposits, withdrawals, and share management.

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `CONTRACT-OWNER` | tx-sender | Deployer address |
| `PRECISION` | u1000000 | 6 decimal precision |
| `MAX-FEE-RATE` | u200 | 2% maximum fee (200 basis points) |
| `DEFAULT-WITHDRAWAL-FEE` | u50 | 0.5% default fee (50 basis points) |

### Error Codes

| Code | Name | Description |
|------|------|-------------|
| u100 | ERR-NOT-AUTHORIZED | Caller not authorized |
| u101 | ERR-INSUFFICIENT-BALANCE | Insufficient share balance |
| u102 | ERR-ZERO-AMOUNT | Zero amount not allowed |
| u103 | ERR-INVALID-FEE-RATE | Fee rate exceeds maximum |
| u104 | ERR-CALCULATION-ERROR | Mathematical calculation failed |
| u105 | ERR-TRANSFER-FAILED | STX transfer failed |

### State Variables

```clarity
(define-data-var total-shares uint u0)
(define-data-var total-assets uint u0)
(define-data-var withdrawal-fee-rate uint DEFAULT-WITHDRAWAL-FEE)
(define-data-var fee-balance uint u0)
(define-data-var contract-paused bool false)
```

### Public Functions

#### deposit

```clarity
(define-public (deposit (amount uint)))
```

**Description**: Accept STX deposit and mint proportional vault shares.

**Parameters**:
- `amount` (uint): Amount of STX to deposit (in micro-STX)

**Returns**: `(ok shares-minted)` or error

**Share Calculation**:
- First deposit: `shares = amount` (1:1 ratio)
- Subsequent: `shares = (amount × total-shares) / total-assets`

**Example**:
```clarity
;; Deposit 1 STX
(contract-call? .vault-core deposit u1000000)
;; Returns: (ok u1000000)
```

**Events Emitted**:
```clarity
{
  event: "deposit",
  user: principal,
  amount: uint,
  shares-minted: uint,
  timestamp: uint
}
```

---

#### withdraw

```clarity
(define-public (withdraw (shares uint)))
```

**Description**: Burn vault shares and return STX to user (minus fee).

**Parameters**:
- `shares` (uint): Number of shares to burn

**Returns**: `(ok net-stx-amount)` or error

**STX Calculation**:
- Gross: `stx = (shares × total-assets) / total-shares`
- Fee: `fee = stx × withdrawal-fee-rate / 10000`
- Net: `net = stx - fee`

**Example**:
```clarity
;; Withdraw 500,000 shares at 0.5% fee
(contract-call? .vault-core withdraw u500000)
;; Returns: (ok u497500) - 500k STX minus 2.5k fee
```

**Events Emitted**:
```clarity
{
  event: "withdrawal",
  user: principal,
  shares-burned: uint,
  stx-returned: uint,
  fee-collected: uint,
  timestamp: uint
}
```

---

#### set-withdrawal-fee

```clarity
(define-public (set-withdrawal-fee (new-rate uint)))
```

**Description**: Update withdrawal fee rate (owner only).

**Parameters**:
- `new-rate` (uint): New fee rate in basis points (max 200 = 2%)

**Returns**: `(ok true)` or error

**Access Control**: CONTRACT-OWNER only

**Example**:
```clarity
;; Set fee to 1% (100 basis points)
(contract-call? .vault-core set-withdrawal-fee u100)
```

---

#### collect-fees

```clarity
(define-public (collect-fees (recipient principal)))
```

**Description**: Withdraw accumulated fees (owner only).

**Parameters**:
- `recipient` (principal): Address to receive fees

**Returns**: `(ok fees-collected)` or error

**Access Control**: CONTRACT-OWNER only

**Example**:
```clarity
(contract-call? .vault-core collect-fees 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

---

#### pause-contract / unpause-contract

```clarity
(define-public (pause-contract))
(define-public (unpause-contract))
```

**Description**: Emergency pause/unpause deposits and withdrawals.

**Access Control**: CONTRACT-OWNER only

**Effect**: When paused, deposits and withdrawals are blocked

---

### Read-Only Functions

#### get-share-price

```clarity
(define-read-only (get-share-price))
```

**Returns**: Current price per share (6 decimal precision)

**Formula**: `(total-assets × PRECISION) / total-shares`

**Example**: `u1000000` = 1.000000 STX per share

---

#### get-user-shares

```clarity
(define-read-only (get-user-shares (user principal)))
```

**Returns**: User's vault share balance

---

#### get-user-stx-value

```clarity
(define-read-only (get-user-stx-value (user principal)))
```

**Returns**: User's current STX value based on shares owned

**Formula**: `(shares × share-price) / PRECISION`

---

#### get-total-assets / get-total-shares

```clarity
(define-read-only (get-total-assets))
(define-read-only (get-total-shares))
```

**Returns**: Total STX in vault / Total shares issued

---

#### get-withdrawal-fee-rate

```clarity
(define-read-only (get-withdrawal-fee-rate))
```

**Returns**: Current withdrawal fee rate (basis points)

---

#### get-accumulated-fees

```clarity
(define-read-only (get-accumulated-fees))
```

**Returns**: Total fees collected and not yet withdrawn

---

#### is-paused

```clarity
(define-read-only (is-paused))
```

**Returns**: Contract pause status (true/false)

---

## vault-token.clar

SIP-010 compliant fungible token for vault shares.

### Token Metadata

| Property | Value |
|----------|-------|
| Name | VaultaYield Shares |
| Symbol | vySTX |
| Decimals | 6 |

### SIP-010 Functions

#### transfer

```clarity
(define-public (transfer 
  (amount uint) 
  (sender principal) 
  (recipient principal) 
  (memo (optional (buff 34)))))
```

**Description**: Transfer vault share tokens.

**Authorization**: Sender must be tx-sender or contract-caller

---

#### get-name / get-symbol / get-decimals

```clarity
(define-read-only (get-name))
(define-read-only (get-symbol))
(define-read-only (get-decimals))
```

**Returns**: Token metadata

---

#### get-balance

```clarity
(define-read-only (get-balance (account principal)))
```

**Returns**: Token balance for account

---

#### get-total-supply

```clarity
(define-read-only (get-total-supply))
```

**Returns**: Total token supply

---

### Privileged Functions

#### mint / burn

```clarity
(define-public (mint (amount uint) (recipient principal)))
(define-public (burn (amount uint) (owner principal)))
```

**Description**: Mint/burn vault share tokens.

**Access Control**: Only authorized vault-core contract

**Usage**: Called automatically during deposits/withdrawals

---

### Admin Functions

#### set-vault-core

```clarity
(define-public (set-vault-core (vault-contract principal)))
```

**Description**: Register authorized vault-core contract.

**Access Control**: CONTRACT-OWNER only

---

#### set-token-uri

```clarity
(define-public (set-token-uri (new-uri (optional (string-utf8 256)))))
```

**Description**: Update token metadata URI.

**Access Control**: CONTRACT-OWNER only

---

## fee-collector.clar

Fee collection and management contract.

### State Variables

```clarity
(define-data-var accumulated-fees uint u0)
(define-data-var total-fees-collected uint u0)
(define-data-var vault-core-contract (optional principal) none)
```

### Public Functions

#### collect-fee

```clarity
(define-public (collect-fee (amount uint)))
```

**Description**: Record fee collection from vault operations.

**Access Control**: Only authorized vault-core contract

**Updates**:
- `accumulated-fees` += amount
- `total-fees-collected` += amount

---

#### withdraw-fees

```clarity
(define-public (withdraw-fees (recipient principal)))
```

**Description**: Withdraw accumulated fees.

**Access Control**: CONTRACT-OWNER only

**Effect**: Transfers accumulated fees to recipient, resets balance

---

#### set-vault-core

```clarity
(define-public (set-vault-core (vault-contract principal)))
```

**Description**: Register authorized vault-core contract.

**Access Control**: CONTRACT-OWNER only

---

### Read-Only Functions

#### get-accumulated-fees

```clarity
(define-read-only (get-accumulated-fees))
```

**Returns**: Current accumulated fees (withdrawable)

---

#### get-total-fees-collected

```clarity
(define-read-only (get-total-fees-collected))
```

**Returns**: Lifetime total fees collected

---

## Integration Guide

### Deployment Order

1. Deploy `vault-token.clar`
2. Deploy `fee-collector.clar`
3. Deploy `vault-core.clar`
4. Call `vault-token.set-vault-core(vault-core-address)`
5. Call `fee-collector.set-vault-core(vault-core-address)`

### Frontend Integration

```javascript
// Deposit STX
const depositTx = await openContractCall({
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'vault-core',
  functionName: 'deposit',
  functionArgs: [uintCV(1000000)], // 1 STX
});

// Get user shares
const shares = await callReadOnlyFunction({
  contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contractName: 'vault-core',
  functionName: 'get-user-shares',
  functionArgs: [principalCV(userAddress)],
});
```

---

## Security Considerations

1. **Access Control**: Always verify caller authorization
2. **Reentrancy**: Use checks-effects-interactions pattern
3. **Integer Overflow**: Clarity prevents overflow natively
4. **Fee Limits**: Enforce maximum fee constraints
5. **Pause Mechanism**: Use for emergency situations only

---

*Last updated: 2026-01-30*
