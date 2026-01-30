import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

// ========================================
// DEPOSIT TESTS
// ========================================

Clarinet.test({
    name: "Can deposit STX and receive shares (1:1 for first deposit)",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-core',
                'deposit',
                [types.uint(1000000)], // 1 STX (6 decimals)
                user1.address
            )
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.receipts[0].result, '(ok u1000000)'); // 1:1 ratio
        block.receipts[0].events.expectSTXTransferEvent(
            1000000,
            user1.address,
            `${deployer.address}.vault-core`
        );
    },
});

Clarinet.test({
    name: "Second deposit calculates shares proportionally",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            // First deposit: 1M STX → 1M shares
            Tx.contractCall(
                'vault-core',
                'deposit',
                [types.uint(1000000)],
                user1.address
            ),
            // Second deposit: 500K STX → 500K shares (same price)
            Tx.contractCall(
                'vault-core',
                'deposit',
                [types.uint(500000)],
                user1.address
            )
        ]);
        
        assertEquals(block.receipts.length, 2);
        assertEquals(block.receipts[0].result, '(ok u1000000)');
        assertEquals(block.receipts[1].result, '(ok u500000)');
        
        // Check total shares
        let query = chain.callReadOnlyFn(
            'vault-core',
            'get-user-shares',
            [types.principal(user1.address)],
            user1.address
        );
        assertEquals(query.result, 'u1500000');
    },
});

Clarinet.test({
    name: "Cannot deposit zero amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-core',
                'deposit',
                [types.uint(0)],
                user1.address
            )
        ]);
        
        assertEquals(block.receipts[0].result, '(err u102)'); // ERR-ZERO-AMOUNT
    },
});

Clarinet.test({
    name: "Multiple users can deposit and receive correct shares",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address),
            Tx.contractCall('vault-core', 'deposit', [types.uint(2000000)], user2.address),
        ]);
        
        assertEquals(block.receipts[0].result, '(ok u1000000)');
        assertEquals(block.receipts[1].result, '(ok u2000000)');
        
        // Check total assets
        let totalAssets = chain.callReadOnlyFn('vault-core', 'get-total-assets', [], user1.address);
        assertEquals(totalAssets.result, 'u3000000');
    },
});

// ========================================
// WITHDRAWAL TESTS
// ========================================

Clarinet.test({
    name: "Can withdraw shares and receive STX minus fee",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            // First deposit
            Tx.contractCall(
                'vault-core',
                'deposit',
                [types.uint(1000000)],
                user1.address
            ),
            // Then withdraw all shares
            Tx.contractCall(
                'vault-core',
                'withdraw',
                [types.uint(1000000)],
                user1.address
            )
        ]);
        
        assertEquals(block.receipts.length, 2);
        // Should receive 995,000 STX (1M - 0.5% fee = 1M - 5K)
        assertEquals(block.receipts[1].result, '(ok u995000)');
        
        // Check fee accumulation
        let fees = chain.callReadOnlyFn('vault-core', 'get-accumulated-fees', [], user1.address);
        assertEquals(fees.result, 'u5000');
    },
});

Clarinet.test({
    name: "Cannot withdraw zero shares",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address),
            Tx.contractCall('vault-core', 'withdraw', [types.uint(0)], user1.address)
        ]);
        
        assertEquals(block.receipts[1].result, '(err u102)'); // ERR-ZERO-AMOUNT
    },
});

Clarinet.test({
    name: "Cannot withdraw more shares than balance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address),
            Tx.contractCall('vault-core', 'withdraw', [types.uint(2000000)], user1.address)
        ]);
        
        assertEquals(block.receipts[1].result, '(err u101)'); // ERR-INSUFFICIENT-BALANCE
    },
});

Clarinet.test({
    name: "Partial withdrawal works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address),
            Tx.contractCall('vault-core', 'withdraw', [types.uint(500000)], user1.address)
        ]);
        
        // Should receive 497,500 STX (500K - 0.5% = 500K - 2.5K)
        assertEquals(block.receipts[1].result, '(ok u497500)');
        
        // Should have 500K shares remaining
        let shares = chain.callReadOnlyFn(
            'vault-core',
            'get-user-shares',
            [types.principal(user1.address)],
            user1.address
        );
        assertEquals(shares.result, 'u500000');
    },
});

// ========================================
// FEE MANAGEMENT TESTS
// ========================================

Clarinet.test({
    name: "Owner can set withdrawal fee rate",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-core',
                'set-withdrawal-fee',
                [types.uint(100)], // Set to 1% (100 basis points)
                deployer.address
            )
        ]);
        
        assertEquals(block.receipts[0].result, '(ok true)');
        
        let feeRate = chain.callReadOnlyFn('vault-core', 'get-withdrawal-fee-rate', [], deployer.address);
        assertEquals(feeRate.result, 'u100');
    },
});

Clarinet.test({
    name: "Non-owner cannot set withdrawal fee",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-core',
                'set-withdrawal-fee',
                [types.uint(100)],
                user1.address // Non-owner calling
            )
        ]);
        
        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Cannot set fee rate above maximum (2%)",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-core',
                'set-withdrawal-fee',
                [types.uint(300)], // Try to set 3% (above 2% max)
                deployer.address
            )
        ]);
        
        assertEquals(block.receipts[0].result, '(err u103)'); // ERR-INVALID-FEE-RATE
    },
});

Clarinet.test({
    name: "Owner can collect accumulated fees",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            // Generate fees through withdrawal
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address),
            Tx.contractCall('vault-core', 'withdraw', [types.uint(1000000)], user1.address),
            // Collect fees
            Tx.contractCall(
                'vault-core',
                'collect-fees',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        // Should collect 5,000 STX in fees
        assertEquals(block.receipts[2].result, '(ok u5000)');
        
        // Accumulated fees should be reset to 0
        let fees = chain.callReadOnlyFn('vault-core', 'get-accumulated-fees', [], deployer.address);
        assertEquals(fees.result, 'u0');
    },
});

Clarinet.test({
    name: "Cannot collect fees when none accumulated",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-core',
                'collect-fees',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);
        
        assertEquals(block.receipts[0].result, '(err u102)'); // ERR-ZERO-AMOUNT
    },
});

// ========================================
// PAUSE/UNPAUSE TESTS
// ========================================

Clarinet.test({
    name: "Owner can pause contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'pause-contract', [], deployer.address)
        ]);
        
        assertEquals(block.receipts[0].result, '(ok true)');
        
        let paused = chain.callReadOnlyFn('vault-core', 'is-paused', [], deployer.address);
        assertEquals(paused.result, 'true');
    },
});

Clarinet.test({
    name: "Cannot deposit when paused",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'pause-contract', [], deployer.address),
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address)
        ]);
        
        assertEquals(block.receipts[1].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Cannot withdraw when paused",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address),
            Tx.contractCall('vault-core', 'pause-contract', [], deployer.address),
            Tx.contractCall('vault-core', 'withdraw', [types.uint(500000)], user1.address)
        ]);
        
        assertEquals(block.receipts[2].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Owner can unpause contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'pause-contract', [], deployer.address),
            Tx.contractCall('vault-core', 'unpause-contract', [], deployer.address),
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address)
        ]);
        
        assertEquals(block.receipts[0].result, '(ok true)');
        assertEquals(block.receipts[1].result, '(ok true)');
        assertEquals(block.receipts[2].result, '(ok u1000000)'); // Deposit works after unpause
    },
});

// ========================================
// READ-ONLY FUNCTION TESTS
// ========================================

Clarinet.test({
    name: "Get share price is 1.0 initially",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address)
        ]);
        
        let sharePrice = chain.callReadOnlyFn('vault-core', 'get-share-price', [], user1.address);
        assertEquals(sharePrice.result, 'u1000000'); // 1.000000 (6 decimals)
    },
});

Clarinet.test({
    name: "Get user STX value calculates correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address)
        ]);
        
        let stxValue = chain.callReadOnlyFn(
            'vault-core',
            'get-user-stx-value',
            [types.principal(user1.address)],
            user1.address
        );
        assertEquals(stxValue.result, 'u1000000');
    },
});

Clarinet.test({
    name: "Get contract owner returns deployer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let owner = chain.callReadOnlyFn('vault-core', 'get-contract-owner', [], deployer.address);
        assertEquals(owner.result, deployer.address);
    },
});

Clarinet.test({
    name: "Get total assets and shares updates correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('vault-core', 'deposit', [types.uint(1000000)], user1.address),
            Tx.contractCall('vault-core', 'deposit', [types.uint(500000)], user2.address),
        ]);
        
        let totalAssets = chain.callReadOnlyFn('vault-core', 'get-total-assets', [], user1.address);
        let totalShares = chain.callReadOnlyFn('vault-core', 'get-total-shares', [], user1.address);
        
        assertEquals(totalAssets.result, 'u1500000');
        assertEquals(totalShares.result, 'u1500000');
    },
});
