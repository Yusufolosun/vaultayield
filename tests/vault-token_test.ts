import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

// ========================================
// SIP-010 STANDARD TESTS
// ========================================

Clarinet.test({
    name: "Token has correct name",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn('vault-token', 'get-name', [], user1.address);
        assertEquals(result.result, '(ok "VaultaYield Shares")');
    },
});

Clarinet.test({
    name: "Token has correct symbol",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn('vault-token', 'get-symbol', [], user1.address);
        assertEquals(result.result, '(ok "vySTX")');
    },
});

Clarinet.test({
    name: "Token has correct decimals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn('vault-token', 'get-decimals', [], user1.address);
        assertEquals(result.result, '(ok u6)');
    },
});

Clarinet.test({
    name: "Initial token supply is zero",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn('vault-token', 'get-total-supply', [], user1.address);
        assertEquals(result.result, '(ok u0)');
    },
});

Clarinet.test({
    name: "Initial balance is zero for any account",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn(
            'vault-token',
            'get-balance',
            [types.principal(user1.address)],
            user1.address
        );
        assertEquals(result.result, '(ok u0)');
    },
});

Clarinet.test({
    name: "Token URI is none initially",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let result = chain.callReadOnlyFn('vault-token', 'get-token-uri', [], user1.address);
        assertEquals(result.result, '(ok none)');
    },
});

// ========================================
// ADMIN FUNCTION TESTS
// ========================================

Clarinet.test({
    name: "Owner can set vault core contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const vaultCoreAddress = `${deployer.address}.vault-core`;

        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'set-vault-core',
                [types.principal(vaultCoreAddress)],
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
        const vaultCoreAddress = `${deployer.address}.vault-core`;

        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'set-vault-core',
                [types.principal(vaultCoreAddress)],
                user1.address // Non-owner
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Owner can set token URI",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'set-token-uri',
                [types.some(types.utf8("https://vaultayield.io/token-metadata.json"))],
                deployer.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(ok true)');

        // Verify URI was set
        let uri = chain.callReadOnlyFn('vault-token', 'get-token-uri', [], deployer.address);
        assertEquals(uri.result, '(ok (some u"https://vaultayield.io/token-metadata.json"))');
    },
});

Clarinet.test({
    name: "Non-owner cannot set token URI",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'set-token-uri',
                [types.some(types.utf8("https://example.com"))],
                user1.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

// ========================================
// MINT/BURN AUTHORIZATION TESTS
// ========================================

Clarinet.test({
    name: "Cannot mint without authorized vault core",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'mint',
                [types.uint(1000000), types.principal(user1.address)],
                user1.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Cannot burn without authorized vault core",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'burn',
                [types.uint(1000000), types.principal(user1.address)],
                user1.address
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

// ========================================
// TRANSFER TESTS
// ========================================

Clarinet.test({
    name: "Transfer requires sender authorization",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;

        // This test would require tokens to be minted first
        // Testing the authorization check
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'transfer',
                [
                    types.uint(1000),
                    types.principal(user1.address),
                    types.principal(user2.address),
                    types.none()
                ],
                user2.address // user2 trying to transfer user1's tokens
            )
        ]);

        assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
    },
});

Clarinet.test({
    name: "Sender can transfer own tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;

        // First, set up vault core and mint tokens (simulation)
        // Note: In actual scenario, tokens would be minted through vault-core deposit

        let block = chain.mineBlock([
            // Set vault core
            Tx.contractCall(
                'vault-token',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                deployer.address
            ),
        ]);

        // Transfer test would require minted tokens
        // This is a placeholder showing the transfer structure
    },
});

Clarinet.test({
    name: "Transfer emits memo when provided",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;
        const user2 = accounts.get('wallet_2')!;

        // Test that memo parameter is handled correctly
        // Actual transfer would require minted tokens

        // This demonstrates the function signature
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'transfer',
                [
                    types.uint(1000),
                    types.principal(user1.address),
                    types.principal(user2.address),
                    types.some(types.buff(new TextEncoder().encode("test memo")))
                ],
                user1.address
            )
        ]);

        // Would check for print event with memo
    },
});

// ========================================
// INTEGRATION SCENARIOS
// ========================================

Clarinet.test({
    name: "Token metadata functions return SIP-010 compliant values",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const user1 = accounts.get('wallet_1')!;

        // Verify all metadata functions
        let name = chain.callReadOnlyFn('vault-token', 'get-name', [], user1.address);
        let symbol = chain.callReadOnlyFn('vault-token', 'get-symbol', [], user1.address);
        let decimals = chain.callReadOnlyFn('vault-token', 'get-decimals', [], user1.address);

        // All should return ok responses
        assertEquals(name.result.startsWith('(ok'), true);
        assertEquals(symbol.result.startsWith('(ok'), true);
        assertEquals(decimals.result, '(ok u6)');
    },
});

Clarinet.test({
    name: "Vault core authorization is enforced for privileged operations",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;

        // Without setting vault core, mint/burn should fail
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'mint',
                [types.uint(1000000), types.principal(user1.address)],
                deployer.address
            ),
            Tx.contractCall(
                'vault-token',
                'burn',
                [types.uint(1000000), types.principal(user1.address)],
                deployer.address
            )
        ]);

        // Both should fail with ERR-NOT-AUTHORIZED
        assertEquals(block.receipts[0].result, '(err u100)');
        assertEquals(block.receipts[1].result, '(err u100)');
    },
});

Clarinet.test({
    name: "Only owner can update contract configuration",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const user1 = accounts.get('wallet_1')!;

        // Non-owner attempts to update configuration
        let block = chain.mineBlock([
            Tx.contractCall(
                'vault-token',
                'set-vault-core',
                [types.principal(`${deployer.address}.vault-core`)],
                user1.address // Non-owner
            ),
            Tx.contractCall(
                'vault-token',
                'set-token-uri',
                [types.some(types.utf8("https://unauthorized.com"))],
                user1.address // Non-owner
            )
        ]);

        // Both should fail
        assertEquals(block.receipts[0].result, '(err u100)');
        assertEquals(block.receipts[1].result, '(err u100)');
    },
});
