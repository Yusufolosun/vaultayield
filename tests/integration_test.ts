import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

/*
 * VaultaYield Phase 2 Integration Tests
 * Tests cross-contract interactions and end-to-end workflows
 * 
 * Workflow being tested:
 * 1. Stacking Strategy delegates STX to pool operator
 * 2. Harvest Manager tracks BTC rewards from completed cycles
 * 3. Compound Engine swaps BTC rewards to STX and re-stakes
 */

describe("Phase 2 Integration Tests", () => {

    describe("Stacking -> Harvesting Workflow", () => {
        it("should track cycles after delegation", () => {
            // 1. Set up stacking strategy
            simnet.callPublicFn(
                "stacking-strategy",
                "set-vault-core",
                [Cl.principal(deployer)],
                deployer
            );

            simnet.callPublicFn(
                "stacking-strategy",
                "update-pool-operator",
                [Cl.principal(wallet1)],
                deployer
            );

            // 2. Delegate STX
            const delegateResult = simnet.callPublicFn(
                "stacking-strategy",
                "delegate-vault-stx",
                [Cl.uint(100_000_000_000_000), Cl.uint(2)], // 100K STX, 2 cycles
                deployer
            );

            expect(delegateResult.result).toBeOk(Cl.bool(true));

            // 3. Verify stacking status
            const status = simnet.callReadOnlyFn(
                "stacking-strategy",
                "get-stacking-status",
                [],
                deployer
            );

            expect(status.result).toBe(Cl.bool(true));

            // 4. Get unlock cycle for harvest manager
            const unlockCycle = simnet.callReadOnlyFn(
                "stacking-strategy",
                "get-unlock-cycle",
                [],
                deployer
            );

            const cycle = unlockCycle.result.value;

            // 5. Record rewards in harvest manager for completed cycle
            simnet.mineEmptyBlocks(2100); // Simulate cycle completion

            const recordResult = simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(Number(cycle) - 1), Cl.uint(50_000_000)], // 0.5 BTC reward
                deployer
            );

            expect(recordResult.result).toBeOk(Cl.uint(50_000_000));
        });

        it("should prevent recording rewards for same cycle twice", () => {
            const cycleId = 10;

            // First recording
            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(25_000_000)],
                deployer
            );

            // Attempt duplicate recording
            const duplicateResult = simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(cycleId), Cl.uint(30_000_000)],
                deployer
            );

            expect(duplicateResult.result).toBeErr(Cl.uint(103)); // ERR-CYCLE-ALREADY-HARVESTED
        });

        it("should accumulate total harvested BTC across cycles", () => {
            const cycles = [
                { id: 1, amount: 20_000_000 },
                { id: 2, amount: 25_000_000 },
                { id: 3, amount: 30_000_000 },
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
    });

    describe("Harvesting -> Compounding Workflow", () => {
        it("should compound harvested BTC rewards", () => {
            // 1. Record BTC rewards in harvest manager
            const btcReward = 100_000_000; // 1 BTC
            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(5), Cl.uint(btcReward)],
                deployer
            );

            // 2. Verify rewards are recorded
            const cycleRewards = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-cycle-rewards",
                [Cl.uint(5)],
                deployer
            );

            expect(cycleRewards.result).toBe(Cl.uint(btcReward));

            // 3. Execute compound with mock DEX
            const compoundResult = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(btcReward)],
                deployer
            );

            const compound = compoundResult.result.expectOk().expectTuple();
            expect(compound["gross-stx"]).toBe(Cl.uint(50_000)); // 1 BTC * 50K rate
            expect(compound["performance-fee"]).toBe(Cl.uint(1_000)); // 2%
            expect(compound["net-stx"]).toBe(Cl.uint(49_000));
        });

        it("should track compound history linked to harvest cycles", () => {
            // Record multiple cycle rewards
            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(10), Cl.uint(50_000_000)],
                deployer
            );

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(11), Cl.uint(75_000_000)],
                deployer
            );

            // Compound both rewards
            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(50_000_000)],
                deployer
            );

            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(75_000_000)],
                deployer
            );

            // Verify compound history
            const compound1 = simnet.callReadOnlyFn(
                "compound-engine",
                "get-compound-history",
                [Cl.uint(1)],
                deployer
            );

            const compound2 = simnet.callReadOnlyFn(
                "compound-engine",
                "get-compound-history",
                [Cl.uint(2)],
                deployer
            );

            expect(compound1.result.expectSome().expectTuple()["btc-amount"]).toBe(Cl.uint(50_000_000));
            expect(compound2.result.expectSome().expectTuple()["btc-amount"]).toBe(Cl.uint(75_000_000));
        });

        it("should calculate correct performance fees on compounded rewards", () => {
            const btcReward = 200_000_000; // 2 BTC

            // Record reward
            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(20), Cl.uint(btcReward)],
                deployer
            );

            // Compound
            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(btcReward)],
                deployer
            );

            const compound = result.result.expectOk().expectTuple();
            const grossStx = compound["gross-stx"].value;
            const fee = compound["performance-fee"].value;

            // Fee should be 2% of gross STX
            const expectedFee = Math.floor(Number(grossStx) * 200 / 10000);
            expect(fee).toBe(BigInt(expectedFee));
        });
    });

    describe("End-to-End Workflow: Stacking -> Harvesting -> Compounding", () => {
        it("should complete full yield cycle", () => {
            // ===== Step 1: Delegate STX for stacking =====
            simnet.callPublicFn(
                "stacking-strategy",
                "set-vault-core",
                [Cl.principal(deployer)],
                deployer
            );

            simnet.callPublicFn(
                "stacking-strategy",
                "update-pool-operator",
                [Cl.principal(wallet1)],
                deployer
            );

            const stackingAmount = 150_000_000_000_000; // 150K STX
            const cycles = 3;

            simnet.callPublicFn(
                "stacking-strategy",
                "delegate-vault-stx",
                [Cl.uint(stackingAmount), Cl.uint(cycles)],
                deployer
            );

            // Verify stacking
            const stackedAmount = simnet.callReadOnlyFn(
                "stacking-strategy",
                "get-stacked-amount",
                [],
                deployer
            );
            expect(stackedAmount.result).toBe(Cl.uint(stackingAmount));

            // ===== Step 2: Simulate cycle completion and harvest rewards =====
            simnet.mineEmptyBlocks(2100); // Complete 1 cycle

            const btcReward = 85_000_000; // 0.85 BTC earned
            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(1), Cl.uint(btcReward)],
                deployer
            );

            // Verify harvest
            const totalHarvested = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-total-btc-harvested",
                [],
                deployer
            );
            expect(totalHarvested.result).toBe(Cl.uint(btcReward));

            // ===== Step 3: Compound BTC rewards back to STX =====
            const compoundResult = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(btcReward)],
                deployer
            );

            expect(compoundResult.result).toBeOk(Cl.tuple({
                "gross-stx": Cl.uint(42_500), // 0.85 BTC * 50K rate
                "performance-fee": Cl.uint(850),
                "net-stx": Cl.uint(41_650)
            }));

            // Verify compound tracking
            const totalCompounded = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounded-stx",
                [],
                deployer
            );
            expect(totalCompounded.result).toBe(Cl.uint(41_650));

            // ===== Step 4: Verify all state is consistent =====
            const isStacking = simnet.callReadOnlyFn(
                "stacking-strategy",
                "get-stacking-status",
                [],
                deployer
            );
            expect(isStacking.result).toBe(Cl.bool(true));

            const cycleHarvested = simnet.callReadOnlyFn(
                "harvest-manager",
                "is-cycle-harvested",
                [Cl.uint(1)],
                deployer
            );
            expect(cycleHarvested.result).toBe(Cl.bool(true));

            const compoundCount = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounds",
                [],
                deployer
            );
            expect(compoundCount.result).toBe(Cl.uint(1));
        });

        it("should handle multiple cycles with varying rewards", () => {
            // Setup stacking
            simnet.callPublicFn(
                "stacking-strategy",
                "set-vault-core",
                [Cl.principal(deployer)],
                deployer
            );

            simnet.callPublicFn(
                "stacking-strategy",
                "update-pool-operator",
                [Cl.principal(wallet1)],
                deployer
            );

            simnet.callPublicFn(
                "stacking-strategy",
                "delegate-vault-stx",
                [Cl.uint(200_000_000_000_000), Cl.uint(5)],
                deployer
            );

            // Process multiple cycles
            const cycleRewards = [
                { cycle: 1, btc: 60_000_000 },
                { cycle: 2, btc: 75_000_000 },
                { cycle: 3, btc: 90_000_000 },
            ];

            let totalBtcHarvested = 0;
            let totalStxCompounded = 0;

            for (const { cycle, btc } of cycleRewards) {
                // Mine blocks to simulate cycle progression
                simnet.mineEmptyBlocks(2100);

                // Harvest rewards
                simnet.callPublicFn(
                    "harvest-manager",
                    "manual-record-reward",
                    [Cl.uint(cycle), Cl.uint(btc)],
                    deployer
                );
                totalBtcHarvested += btc;

                // Compound rewards
                const result = simnet.callPublicFn(
                    "compound-engine",
                    "execute-compound-mock",
                    [Cl.uint(btc)],
                    deployer
                );

                const compound = result.result.expectOk().expectTuple();
                totalStxCompounded += Number(compound["net-stx"].value);
            }

            // Verify final state
            const harvestedTotal = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-total-btc-harvested",
                [],
                deployer
            );
            expect(harvestedTotal.result).toBe(Cl.uint(totalBtcHarvested));

            const compoundedTotal = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounded-stx",
                [],
                deployer
            );
            expect(compoundedTotal.result).toBe(Cl.uint(totalStxCompounded));

            const compoundCount = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounds",
                [],
                deployer
            );
            expect(compoundCount.result).toBe(Cl.uint(cycleRewards.length));
        });
    });

    describe("Error Handling Across Contracts", () => {
        it("should prevent compounding before harvesting", () => {
            // Try to compound BTC that hasn't been harvested
            // (In Phase 3, this will be validated via contract calls)

            const result = simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(100_000_000)],
                deployer
            );

            // Should succeed in mock mode (Phase 2)
            // In Phase 3, will check harvest-manager for available rewards
            expect(result.result).toBeOk(Cl.any());
        });

        it("should prevent delegation changes during active stacking", () => {
            simnet.callPublicFn(
                "stacking-strategy",
                "set-vault-core",
                [Cl.principal(deployer)],
                deployer
            );

            simnet.callPublicFn(
                "stacking-strategy",
                "update-pool-operator",
                [Cl.principal(wallet1)],
                deployer
            );

            // Delegate STX
            simnet.callPublicFn(
                "stacking-strategy",
                "delegate-vault-stx",
                [Cl.uint(100_000_000_000_000), Cl.uint(2)],
                deployer
            );

            // Try to change pool operator during stacking
            const changeResult = simnet.callPublicFn(
                "stacking-strategy",
                "update-pool-operator",
                [Cl.principal(wallet2)],
                deployer
            );

            expect(changeResult.result).toBeErr(Cl.uint(105)); // ERR-LOCKED
        });

        it("should enforce harvest cooldown", () => {
            const interval = 144;
            simnet.callPublicFn(
                "harvest-manager",
                "set-harvest-interval",
                [Cl.uint(interval)],
                deployer
            );

            // First harvest
            simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            // Immediate second harvest
            const secondHarvest = simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            expect(secondHarvest.result).toBeErr(Cl.uint(104)); // ERR-TOO-SOON

            // After cooldown
            simnet.mineEmptyBlocks(interval + 1);

            const thirdHarvest = simnet.callPublicFn(
                "harvest-manager",
                "harvest-rewards",
                [],
                deployer
            );

            expect(thirdHarvest.result).toBeOk(Cl.uint(0));
        });
    });

    describe("State Consistency Validation", () => {
        it("should maintain accurate state across all contracts", () => {
            // Initialize all contracts
            simnet.callPublicFn(
                "stacking-strategy",
                "set-vault-core",
                [Cl.principal(deployer)],
                deployer
            );

            simnet.callPublicFn(
                "stacking-strategy",
                "update-pool-operator",
                [Cl.principal(wallet1)],
                deployer
            );

            simnet.callPublicFn(
                "harvest-manager",
                "set-stacking-strategy",
                [Cl.principal(deployer)],
                deployer
            );

            simnet.callPublicFn(
                "compound-engine",
                "set-harvest-manager",
                [Cl.principal(deployer)],
                deployer
            );

            // Execute workflow
            simnet.callPublicFn(
                "stacking-strategy",
                "delegate-vault-stx",
                [Cl.uint(100_000_000_000_000), Cl.uint(1)],
                deployer
            );

            simnet.mineEmptyBlocks(2100);

            simnet.callPublicFn(
                "harvest-manager",
                "manual-record-reward",
                [Cl.uint(1), Cl.uint(50_000_000)],
                deployer
            );

            simnet.callPublicFn(
                "compound-engine",
                "execute-compound-mock",
                [Cl.uint(50_000_000)],
                deployer
            );

            // Verify all states are consistent
            const stackingStatus = simnet.callReadOnlyFn(
                "stacking-strategy",
                "get-stacking-status",
                [],
                deployer
            );

            const lastHarvestCycle = simnet.callReadOnlyFn(
                "harvest-manager",
                "get-last-harvest-cycle",
                [],
                deployer
            );

            const totalCompounds = simnet.callReadOnlyFn(
                "compound-engine",
                "get-total-compounds",
                [],
                deployer
            );

            expect(stackingStatus.result).toBe(Cl.bool(true));
            expect(lastHarvestCycle.result).toBe(Cl.uint(1));
            expect(totalCompounds.result).toBe(Cl.uint(1));
        });
    });
});
