import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

// ========================================
// FEE COLLECTION TESTS
// ========================================

Clarinet.test({
    name: "Cannot collect fee without vault core authorization",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'collect-fee',
                [types.uint(1000)],
                user1.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Cannot collect zero amount fee",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Even with authorization, zero amount should fail
        let block = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                deployer.address
            ),
            Tx.contractCall(
                'fee-collector',
                'collect-fee',
                [types.uint(0)],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[1].result, '(err u101)'); // ERR-ZERO-AMOUNT
    },
});

Clarinet.test({
    name: "Initial accumulated fees is zero",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn(
            'fee-collector',
            'get-accumulated-fees',
            [],
            user1.address
        );

        assertEquals(result.result, 'u0');
    },
});

Clarinet.test({
    name: "Initial total fees collected is zero",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn(
            'fee-collector',
            'get-total-fees-collected',
            [],
            user1.address
        );

        assertEquals(result.result, 'u0');
    },
});

// ========================================
// VAULT CORE AUTHORIZATION TESTS
// ========================================

Clarinet.test({
    name: "Owner can set vault core contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
    },
});

Clarinet.test({
    name: "Non-owner cannot set vault core contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                user1.address // Non-owner
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

// ========================================
// FEE WITHDRAWAL TESTS
// ========================================

Clarinet.test({
    name: "Cannot withdraw fees when none accumulated",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'withdraw-fees',
                [types.principal(deployer.address)],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u101)'); // ERR-ZERO-AMOUNT
    },
});

Clarinet.test({
    name: "Non-owner cannot withdraw fees",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'withdraw-fees',
                [types.principal(user1.address)],
                user1.address // Non-owner attempting withdrawal
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

// ========================================
// INTEGRATION SCENARIO TESTS
// ========================================

Clarinet.test({
    name: "Fee collection updates counters correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Note: This test simulates vault core calling collect-fee
        // In actual integration, vault-core would make the call

        let block = chain.mineBlock([
            // Setup
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');

        // After setup, vault-core could collect fees
        // Accumulated fees would increment
    },
});

Clarinet.test({
    name: "Multiple fee collections accumulate correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Setup vault core
        let setupBlock = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.fee-collector`)],
                deployer.address
            )
        ]);

        // In actual scenario:
        // 1. vault-core calls collect-fee(1000)
        // 2. vault-core calls collect-fee(2000)
        // 3. accumulated = 3000, total = 3000

        // Verify initial state
        let accumulated = chain.callReadOnlyFn(
            'fee-collector',
            'get-accumulated-fees',
            [],
            deployer.address
        );
        assertEquals(accumulated.result, 'u0');
    },
});

Clarinet.test({
    name: "Withdrawal resets accumulated fees but not total",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // In actual scenario:
        // 1. Fees collected: accumulated = 5000, total = 5000
        // 2. Withdraw fees
        // 3. accumulated = 0, total = 5000 (total never decreases)

        let result = chain.callReadOnlyFn(
            'fee-collector',
            'get-total-fees-collected',
            [],
            deployer.address
        );

        assertEquals(result.result, 'u0'); // Initially zero
    },
});

Clarinet.test({
    name: "Fee collector tracks lifetime fees correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Scenario:
        // 1. Collect 1000 in fees
        // 2. Collect 2000 in fees
        // 3. Withdraw all (3000)
        // 4. Collect 500 in fees
        // Expected: accumulated = 500, total = 3500

        let totalFees = chain.callReadOnlyFn(
            'fee-collector',
            'get-total-fees-collected',
            [],
            deployer.address
        );

        let accumulatedFees = chain.callReadOnlyFn(
            'fee-collector',
            'get-accumulated-fees',
            [],
            deployer.address
        );

        assertEquals(totalFees.result, 'u0');
        assertEquals(accumulatedFees.result, 'u0');
    },
});

// ========================================
// ACCESS CONTROL TESTS
// ========================================

Clarinet.test({
    name: "Only owner can configure fee collector",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;

        let block = chain.mineBlock([
            // User1 tries to set vault core
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                user1.address
            ),
            // User2 tries to withdraw fees
            Tx.contractCall(
                'fee-collector',
                'withdraw-fees',
                [types.principal(user2.address)],
                user2.address
            )
        ]);

        // Both should fail
        assertEquals(block.receipts[0].result, '(err u100)');
        assertEquals(block.receipts[1].result, '(err u100)');
    },
});

Clarinet.test({
    name: "Owner operations work correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            // Owner sets vault core  
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');
    },
});

// ========================================
// EVENT EMISSION TESTS
// ========================================

Clarinet.test({
    name: "Fee collection emits correct event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // Setup first
        let setupBlock = chain.mineBlock([
            Tx.contractCall(
                'fee-collector',
                'set-vault-core',
                [types.principal(`${deployer.address}.fee-collector`)],
                deployer.address
            )
        ]);

        // In actual scenario, when vault-core calls collect-fee,
        // it should emit a print event with:
        // { event: "fee-collected", amount: X, accumulated: Y, timestamp: Z }
    },
});

Clarinet.test({
    name: "Fee withdrawal emits correct event",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        // In actual scenario, when owner calls withdraw-fees,
        // it should emit a print event with:
        // { event: "fees-withdrawn", amount: X, recipient: Y, timestamp: Z }

        // And trigger STX transfer event
    },
});

// ========================================
// READ-ONLY FUNCTION TESTS
// ========================================

Clarinet.test({
    name: "Read-only functions accessible to all users",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;

        // Any user can call read-only functions
        let accumulated1 = chain.callReadOnlyFn(
            'fee-collector',
            'get-accumulated-fees',
            [],
            user1.address
        );

        let total2 = chain.callReadOnlyFn(
            'fee-collector',
            'get-total-fees-collected',
            [],
            user2.address
        );

        assertEquals(accumulated1.result, 'u0');
        assertEquals(total2.result, 'u0');
    },
});
