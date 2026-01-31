import { StacksTestnet } from "@stacks/network";
import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    Cl,
} from "@stacks/transactions";
import * as dotenv from "dotenv";
dotenv.config();

// ========================================
// TESTNET TESTING SCRIPT
// ========================================

const NETWORK = new StacksTestnet();
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

if (!DEPLOYER_KEY) {
    console.error("❌ Set DEPLOYER_PRIVATE_KEY in .env");
    process.exit(1);
}

// Contract addresses (will be filled after deployment)
const CONTRACTS = {
    vaultCore: process.env.VAULT_CORE_ADDRESS || "",
    stackingStrategy: process.env.STACKING_STRATEGY_ADDRESS || "",
    harvestManager: process.env.HARVEST_MANAGER_ADDRESS || "",
    compoundEngine: process.env.COMPOUND_ENGINE_ADDRESS || "",
};

// ========================================
// TEST FUNCTIONS
// ========================================

async function testDeposit(amount: number): Promise<string> {
    console.log(`\n💰 Test: Deposit ${amount / 1_000_000} STX`);

    const txOptions = {
        contractAddress: CONTRACTS.vaultCore.split(".")[0],
        contractName: CONTRACTS.vaultCore.split(".")[1],
        functionName: "deposit",
        functionArgs: [Cl.uint(amount)],
        senderKey: DEPLOYER_KEY,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: BigInt(250000),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ("error" in result) {
        console.error("❌ Deposit failed:", result.error);
        throw new Error(result.error);
    }

    console.log(`✅ Deposit successful: ${result.txid}`);
    return result.txid;
}

async function testDepositWithStacking(
    amount: number,
    cycles: number
): Promise<string> {
    console.log(
        `\n🔒 Test: Deposit ${amount / 1_000_000} STX with stacking (${cycles} cycles)`
    );

    const txOptions = {
        contractAddress: CONTRACTS.vaultCore.split(".")[0],
        contractName: CONTRACTS.vaultCore.split(".")[1],
        functionName: "deposit-with-stacking",
        functionArgs: [Cl.uint(amount), Cl.uint(cycles)],
        senderKey: DEPLOYER_KEY,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: BigInt(250000),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ("error" in result) {
        console.error("❌ Deposit with stacking failed:", result.error);
        throw new Error(result.error);
    }

    console.log(`✅ Deposit with stacking successful: ${result.txid}`);
    return result.txid;
}

async function testManualRewardRecord(
    cycle: number,
    btcAmount: number
): Promise<string> {
    console.log(
        `\n🎁 Test: Record ${btcAmount / 100_000_000} BTC reward for cycle ${cycle}`
    );

    const txOptions = {
        contractAddress: CONTRACTS.harvestManager.split(".")[0],
        contractName: CONTRACTS.harvestManager.split(".")[1],
        functionName: "manual-record-reward",
        functionArgs: [Cl.uint(cycle), Cl.uint(btcAmount)],
        senderKey: DEPLOYER_KEY,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: BigInt(250000),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ("error" in result) {
        console.error("❌ Reward recording failed:", result.error);
        throw new Error(result.error);
    }

    console.log(`✅ Reward recorded successfully: ${result.txid}`);
    return result.txid;
}

async function testCompound(btcAmount: number): Promise<string> {
    console.log(`\n🔄 Test: Compound ${btcAmount / 100_000_000} BTC to STX`);

    const txOptions = {
        contractAddress: CONTRACTS.compoundEngine.split(".")[0],
        contractName: CONTRACTS.compoundEngine.split(".")[1],
        functionName: "execute-compound-mock",
        functionArgs: [Cl.uint(btcAmount)],
        senderKey: DEPLOYER_KEY,
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: BigInt(250000),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, NETWORK);

    if ("error" in result) {
        console.error("❌ Compound failed:", result.error);
        throw new Error(result.error);
    }

    console.log(`✅ Compound successful: ${result.txid}`);
    return result.txid;
}

// ========================================
// MAIN TEST SUITE
// ========================================

async function runTests() {
    console.log("========================================");
    console.log("🧪 VaultaYield Testnet Test Suite");
    console.log("========================================\n");

    // Validate contract addresses
    if (!CONTRACTS.vaultCore) {
        console.error(
            "❌ Contract addresses not set. Update .env after deployment."
        );
        process.exit(1);
    }

    const txIds: string[] = [];

    try {
        // Test 1: Basic deposit
        const depositTx = await testDeposit(100_000_000); // 100 STX
        txIds.push(depositTx);
        await sleep(15000); // Wait for confirmation

        // Test 2: Deposit with stacking
        const stackingTx = await testDepositWithStacking(150_000_000_000_000, 3); // 150K STX, 3 cycles
        txIds.push(stackingTx);
        await sleep(15000);

        // Test 3: Record reward
        const rewardTx = await testManualRewardRecord(100, 50_000_000); // 0.5 BTC for cycle 100
        txIds.push(rewardTx);
        await sleep(15000);

        // Test 4: Compound
        const compoundTx = await testCompound(50_000_000); // 0.5 BTC
        txIds.push(compoundTx);
        await sleep(15000);

        console.log("\n========================================");
        console.log("✅ ALL TESTS PASSED!");
        console.log("========================================\n");

        console.log("📋 Test Results:");
        txIds.forEach((txId, index) => {
            console.log(
                `  ${index + 1}. https://explorer.hiro.so/txid/${txId}?chain=testnet`
            );
        });

        console.log("\n");
    } catch (error) {
        console.error("\n❌ Test suite failed:", error);
        process.exit(1);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run tests
runTests();
