import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

/*
 * VaultaYield Harvest Manager - Unit Tests
 * Tests for BTC reward tracking, cycle management, and harvest logic
 */

describe("harvest-manager contract", () => {

    describe("Contract Initialization", () => {
        it("should initialize with zero total harvested", () => {
            const total = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-total-btc-harvested",
                [],
                deployer
            );

            expect(total.result).toBe(Cl.uint(0));
        });

        it("should initialize with zero last harvest cycle", () => {
            const cycle = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-last-harvest-cycle",
                [],
                deployer
            );

            expect(cycle.result).toBe(Cl.uint(0));
        });

        it("should have default harvest interval", () => {
            const interval = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-harvest-interval",
                [],
                deployer
            );

            expect(interval.result).toBe(Cl.uint(144)); // DEFAULT_HARVEST_INTERVAL
        });

        it("should report zero blocks until next harvest initially", () => {
            const blocks = simnet.callReadOnlyFn(
                "harvest-manager",
                "blocks-until-next-harvest",
                [],
                deployer
            );

            expect(blocks.result).toBe(Cl.uint(0));
        });
    });

    describe("Admin Functions", () => {
        it("should allow owner to set stacking-strategy contract", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "set-stacking-strategy",
                [Cl.principal(wallet1)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));
        });

        it("should reject non-owner setting stacking-strategy", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "set-stacking-strategy",
                [Cl.principal(wallet1)],
                wallet2
            );

            expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });

        it("should allow owner to set compound-engine contract", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "set-compound-engine",
                [Cl.principal(wallet1)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));
        });

        it("should reject non-owner setting compound-engine", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "set-compound-engine",
                [Cl.principal(wallet1)],
                wallet2
            );

            expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });

        it("should allow owner to update harvest interval", () => {
            const newInterval = 100;
            const result = simnet.callPublicFn(
                "harvest-manager",
                "set-harvest-interval",
                [Cl.uint(newInterval)],
                deployer
            );

            expect(result.result).toBeOk(Cl.bool(true));

            // Verify interval was updated
            const interval = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-harvest-interval",
                [],
                deployer
            );

            expect(interval.result).toBe(Cl.uint(newInterval));
        });

        it("should reject interval below minimum", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "set-harvest-interval",
                [Cl.uint(5)], // Below MIN_HARVEST_INTERVAL (10)
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(101)); // ERR-ZERO-AMOUNT
        });

        it("should reject non-owner updating interval", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "set-harvest-interval",
                [Cl.uint(100)],
                wallet1
            );

            expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });
    });

    describe("manual-record-reward", () => {
        it("should allow admin to record reward for a cycle", () => {
            const cycleId = 1;
            const btcAmount = 50000000; // 0.5 BTC in sats

            const result = simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(btcAmount)],
                deployer
            );

            expect(result.result).toBeOk(Cl.uint(btcAmount));
        });

        it("should update total-btc-harvested after recording", () => {
            const btcAmount1 = 50000000;
            const btcAmount2 = 30000000;

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(1), Cl.uint(btcAmount1)],
                deployer
            );

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(2), Cl.uint(btcAmount2)],
                deployer
            );

            const total = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-total-btc-harvested",
                [],
                deployer
            );

            expect(total.result).toBe(Cl.uint(btcAmount1 + btcAmount2));
        });

        it("should update last-harvest-cycle", () => {
            const cycleId = 5;

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(10000000)],
                deployer
            );

            const lastCycle = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-last-harvest-cycle",
                [],
                deployer
            );

            expect(lastCycle.result).toBe(Cl.uint(cycleId));
        });

        it("should mark cycle as harvested", () => {
            const cycleId = 3;

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(10000000)],
                deployer
            );

            const harvested = simnet.callReadOnlyFn(
                "harvest-manager",
                "is-cycle-harvested",
                [Cl.uint(cycleId)],
                deployer
            );

            expect(harvested.result).toBe(Cl.bool(true));
        });

        it("should reject zero amount", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(1), Cl.uint(0)],
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(101)); // ERR-ZERO-AMOUNT
        });

        it("should reject non-admin recording rewards", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(1), Cl.uint(10000000)],
                wallet1
            );

            expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });

        it("should prevent overwriting existing cycle record", () => {
            const cycleId = 4;

            // First record
            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(10000000)],
                deployer
            );

            // Attempt to overwrite
            const result = simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(20000000)],
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(103)); // ERR-CYCLE-ALREADY-HARVESTED
        });

        it("should return correct cycle rewards", () => {
            const cycleId = 6;
            const btcAmount = 75000000;

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(btcAmount)],
                deployer
            );

            const rewards = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-cycle-rewards",
                [Cl.uint(cycleId)],
                deployer
            );

            expect(rewards.result).toBe(Cl.uint(btcAmount));
        });
    });

    describe("harvest-rewards", () => {
        it("should allow anyone to call harvest-rewards", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                wallet1 // Non-admin
            );

            // Should succeed (permissionless)
            expect(result.result).toBeOk(Cl.uint(0));
        });

        it("should succeed on first harvest call", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            expect(result.result).toBeOk(Cl.uint(0));
        });

        it("should enforce cooldown between harvests", () => {
            // First harvest
            simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            // Immediate second harvest (should fail)
            const result = simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            expect(result.result).toBeErr(Cl.uint(104)); // ERR-TOO-SOON
        });

        it("should allow harvest after cooldown period", () => {
            // Set short interval for testing
            simnet.callPublicFn(
                "harvest-manager",
                "set-harvest-interval",
                [Cl.uint(10)],
                deployer
            );

            // First harvest
            simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            // Mine blocks to pass cooldown
            simnet.mineEmptyBlocks(11);

            // Second harvest (should succeed)
            const result = simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            expect(result.result).toBeOk(Cl.uint(0));
        });
    });

    describe("get-pending-rewards", () => {
        it("should return zero in Phase 2", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "get-pending-rewards",
                [],
                deployer
            );

            expect(result.result).toBeOk(Cl.uint(0));
        });

        it("should be callable by anyone", () => {
            const result = simnet.callPublicFn(
                "harvest-manager",
                "get-pending-rewards",
                [],
                wallet1
            );

            expect(result.result).toBeOk(Cl.uint(0));
        });
    });

    describe("Read-only Functions", () => {
        it("should return zero for unharvested cycle", () => {
            const rewards = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-cycle-rewards",
                [Cl.uint(999)],
                deployer
            );

            expect(rewards.result).toBe(Cl.uint(0));
        });

        it("should return false for unharvested cycle", () => {
            const harvested = simnet.callReadOnlyFn(
                "harvest-manager",
                "is-cycle-harvested",
                [Cl.uint(999)],
                deployer
            );

            expect(harvested.result).toBe(Cl.bool(false));
        });

        it("should calculate blocks-until-next-harvest correctly", () => {
            const interval = 50;

            simnet.callPublicFn(
                "harvest-manager",
                "set-harvest-interval",
                [Cl.uint(interval)],
                deployer
            );

            simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            // Mine 20 blocks
            simnet.mineEmptyBlocks(20);

            const blocksRemaining = simnet.callReadOnlyFn(
                "harvest-manager",
                "blocks-until-next-harvest",
                [],
                deployer
            );

            // Should be roughly interval - 20
            expect(blocksRemaining.result).toBe(Cl.uint(30));
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle multiple cycle recordings correctly", () => {
            const cycles = [
                { id: 1, amount: 10000000 },
                { id: 2, amount: 15000000 },
                { id: 3, amount: 12000000 },
            ];

            let expectedTotal = 0;

            for (const cycle of cycles) {
                simnet.callPublicFn(
                    "harvest-manager",
                    "manual-record-reward",
                    [Cl.uint(cycle.id), Cl.uint(cycle.amount)],
                    deployer
                );
                expectedTotal += cycle.amount;
            }

            const total = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-total-btc-harvested",
                [],
                deployer
            );

            expect(total.result).toBe(Cl.uint(expectedTotal));
        });

        it("should track last harvest cycle correctly across multiple recordings", () => {
            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(5), Cl.uint(10000000)],
                deployer
            );

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(10), Cl.uint(15000000)],
                deployer
            );

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(7), Cl.uint(12000000)],
                deployer
            );

            const lastCycle = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-last-harvest-cycle",
                [],
                deployer
            );

            // Last recorded was cycle 7
            expect(lastCycle.result).toBe(Cl.uint(7));
        });
    });
});
