import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

/*
 * VaultaYield Compound Engine - Unit Tests
 * Tests for BTC->STX swap simulation, performance fees, and compounding logic
 */

describe("compound-engine contract", () => {

    describe("Contract Initialization", () => {
        it("should initialize with zero total compounded STX", () => {
            const total = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounded-stx",
                [],
                deployer
            );

            expect(total.result).toBe(Cl.uint(0));
        });

        it("should initialize with zero total compounds", () => {
            const total = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounds",
                [],
                deployer
            );

            expect(total.result).toBe(Cl.uint(0));
        });

        it("should have default slippage tolerance", () => {
            const slippage = simnet.callReadOnlyFn(
                "compound-engine",
                "get-slippage-tolerance",
                [],
                deployer
            );

            expect(slippage.result).toBe(Cl.uint(50)); // DEFAULT_SLIPPAGE_TOLERANCE
        });

        it("should have no DEX contract set initially", () => {
            const dex = simnet.callReadOnlyFn(
                "compound-engine",
                "get-dex-contract",
                [],
                deployer
            );

            expect(dex.result).toBe(Cl.none());
        });

        it("should be in mock DEX mode by default", () => {
            // Mock mode is enabled by default, verify by successful mock compound
            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(100000000)], // 1 BTC
                deployer
            );

            expect(result.result).toBeOk(Cl.tuple({
                "gross-stx": Cl.uint(50000),
                "performance-fee": Cl.uint(1000),
                "net-stx": Cl.uint(49000)
            }));
        });
    });

    describe("Admin Functions", () => {
        it("should allow owner to set DEX contract", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-dex-contract",
                [Cl.principal(wallet1)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));

            // Verify DEX was set
            const dex = simnet.callReadOnlyFn(
                "compound-engine",
                "get-dex-contract",
                [],
                deployer
            );

            expect(dex.result).toBeSome(Cl.principal(wallet1));
        });

        it("should reject non-owner setting DEX", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-dex-contract",
                [Cl.principal(wallet1)],
                wallet2
            );

            expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });

        it("should allow owner to update slippage tolerance", () => {
            const newSlippage = 100; // 1%
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-slippage-tolerance",
                [Cl.uint(newSlippage)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));

            // Verify slippage was updated
            const slippage = simnet.callReadOnlyFn(
                "compound-engine",
                "get-slippage-tolerance",
                [],
                deployer
            );

            expect(slippage.result).toBe(Cl.uint(newSlippage));
        });

        it("should reject slippage above maximum", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-slippage-tolerance",
                [Cl.uint(600)], // Above 5% max
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(102)); // ERR-SLIPPAGE-EXCEEDED
        });

        it("should allow owner to set harvest-manager", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-harvest-manager",
                [Cl.principal(wallet1)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));
        });

        it("should allow owner to set vault-core", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-vault-core",
                [Cl.principal(wallet1)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));
        });

        it("should allow owner to update mock exchange rate", () => {
            const newRate = 60000; // 1 BTC = 60K STX
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-mock-exchange-rate",
                [Cl.uint(newRate)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));
        });

        it("should reject zero exchange rate", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "set-mock-exchange-rate",
                [Cl.uint(0)],
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(101)); // ERR-ZERO-AMOUNT
        });

        it("should allow owner to enable mock DEX mode", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "enable-mock-dex-mode",
                [],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));
        });
    });

    describe("calculate-compound-impact", () => {
        it("should calculate impact for given BTC amount", () => {
            const btcAmount = 100000000; // 1 BTC
            const result = simnet.callReadOnlyFn(
                "compound-engine",
                "calculate-compound-impact",
                [Cl.uint(btcAmount)],
                deployer
            );

            const impact = result.result.expectOk().expectTuple();
            expect(impact["gross-stx"]).toBe(Cl.uint(50000)); // 1 BTC * 50K rate
            expect(impact["performance-fee"]).toBe(Cl.uint(1000)); // 2% of 50K
            expect(impact["net-stx"]).toBe(Cl.uint(49000)); // 50K - 1K
        });

        it("should scale impact correctly for different amounts", () => {
            const btcAmount = 50000000; // 0.5 BTC
            const result = simnet.callReadOnlyFn(
                "compound-engine",
                "calculate-compound-impact",
                [Cl.uint(btcAmount)],
                deployer
            );

            const impact = result.result.expectOk().expectTuple();
            expect(impact["gross-stx"]).toBe(Cl.uint(25000)); // 0.5 BTC * 50K rate
            expect(impact["performance-fee"]).toBe(Cl.uint(500)); // 2% of 25K
            expect(impact["net-stx"]).toBe(Cl.uint(24500)); // 25K - 500
        });
    });

    describe("execute-compound-mock", () => {
        it("should execute mock compound successfully", () => {
            const btcAmount = 100000000; // 1 BTC
            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(btcAmount)],
                deployer
            );

            expect(result.result).toBeOk(Cl.tuple({
                "gross-stx": Cl.uint(50000),
                "performance-fee": Cl.uint(1000),
                "net-stx": Cl.uint(49000)
            }));
        });

        it("should update total-compounded-stx", () => {
            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(100000000)],
                deployer
            );

            const total = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounded-stx",
                [],
                deployer
            );

            expect(total.result).toBe(Cl.uint(49000)); // net-stx from compound
        });

        it("should increment total-compounds counter", () => {
            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(100000000)],
                deployer
            );

            const total = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounds",
                [],
                deployer
            );

            expect(total.result).toBe(Cl.uint(1));
        });

        it("should record compound history", () => {
            const btcAmount = 100000000;

            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(btcAmount)],
                deployer
            );

            const history = simnet.callReadOnlyFn(
                "compound-engine",
                "get-compound-history",
                [Cl.uint(1)],
                deployer
            );

            const record = history.result.expectSome().expectTuple();
            expect(record["btc-amount"]).toBe(Cl.uint(btcAmount));
            expect(record["stx-received"]).toBe(Cl.uint(50000));
            expect(record["fee-amount"]).toBe(Cl.uint(1000));
        });

        it("should reject zero amount", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(0)],
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(101)); // ERR-ZERO-AMOUNT
        });

        it("should reject non-owner execution", () => {
            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(100000000)],
                wallet1
            );

            expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });

        it("should handle multiple compounds correctly", () => {
            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(100000000)], // 1 BTC
                deployer
            );

            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(50000000)], // 0.5 BTC
                deployer
            );

            const totalCompounds = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounds",
                [],
                deployer
            );

            expect(totalCompounds.result).toBe(Cl.uint(2));

            const totalCompounded = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounded-stx",
                [],
                deployer
            );

            // 49000 (from 1 BTC) + 24500 (from 0.5 BTC)
            expect(totalCompounded.result).toBe(Cl.uint(73500));
        });

        it("should use custom exchange rate after update", () => {
            // Set new rate
            simnet.callPublicFn(
                "compound-engine",
                "set-mock-exchange-rate",
                [Cl.uint(60000)], // 60K STX per BTC
                deployer
            );

            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(100000000)], // 1 BTC
                deployer
            );

            const compound = result.result.expectOk().expectTuple();
            expect(compound["gross-stx"]).toBe(Cl.uint(60000)); // New rate
            expect(compound["performance-fee"]).toBe(Cl.uint(1200)); // 2% of 60K
            expect(compound["net-stx"]).toBe(Cl.uint(58800));
        });
    });

    describe("execute-compound (real DEX)", () => {
        it("should return error in Phase 2 (DEX not integrated)", () => {
            // Disable mock mode
            simnet.callPublicFn(
                "compound-engine",
                "set-dex-contract",
                [Cl.principal(wallet1)],
                deployer
            );

            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound",
                [Cl.uint(100000000)],
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(103)); // ERR-DEX-NOT-SET
        });

        it("should require DEX contract to be set", () => {
            simnet.callPublicFn(
                "compound-engine",
                "enable-mock-dex-mode",
                [],
                deployer
            );

            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound",
                [Cl.uint(100000000)],
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(103)); // ERR-DEX-NOT-SET
        });
    });

    describe("Read-only Functions", () => {
        it("should return none for non-existent compound history", () => {
            const history = simnet.callReadOnlyFn(
                "compound-engine",
                "get-compound-history",
                [Cl.uint(999)],
                deployer
            );

            expect(history.result).toBeNone();
        });

        it("should return correct compound history after execution", () => {
            const btcAmount = 200000000; // 2 BTC

            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(btcAmount)],
                deployer
            );

            const history = simnet.callReadOnlyFn(
                "compound-engine",
                "get-compound-history",
                [Cl.uint(1)],
                deployer
            );

            const record = history.result.expectSome().expectTuple();
            expect(record["btc-amount"]).toBe(Cl.uint(btcAmount));
            expect(record["stx-received"]).toBe(Cl.uint(100000)); // 2 BTC * 50K
            expect(record["fee-amount"]).toBe(Cl.uint(2000)); // 2% of 100K
        });
    });

    describe("Performance Fee Calculation", () => {
        it("should calculate 2% performance fee correctly", () => {
            const btcAmount = 100000000; // 1 BTC
            const result = simnet.callReadOnlyFn(
                "compound-engine",
                "calculate-compound-impact",
                [Cl.uint(btcAmount)],
                deployer
            );

            const impact = result.result.expectOk().expectTuple();
            const grossStx = 50000;
            const expectedFee = Math.floor(grossStx * 200 / 10000); // 2%

            expect(impact["performance-fee"]).toBe(Cl.uint(expectedFee));
        });

        it("should deduct fee from gross STX", () => {
            const result = simnet.callReadOnlyFn(
                "compound-engine",
                "calculate-compound-impact",
                [Cl.uint(100000000)],
                deployer
            );

            const impact = result.result.expectOk().expectTuple();
            const grossStx = impact["gross-stx"].value;
            const fee = impact["performance-fee"].value;
            const netStx = impact["net-stx"].value;

            expect(netStx).toBe(grossStx - fee);
        });
    });
});
