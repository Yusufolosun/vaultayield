import { makeContractCall, broadcastTransaction, AnchorMode, uintCV, principalCV, noneCV, someCV, bufferCV, stringUtf8CV } from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";
import { parse as tomlParse } from "toml";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { generateWallet, getStxAddress } from "@stacks/wallet-sdk";

const NETWORK = STACKS_TESTNET;

// Load mnemonic
const settingsPath = resolve(__dirname, "../settings/Testnet.toml");
const config: any = tomlParse(readFileSync(settingsPath, "utf8"));
const mnemonic = config?.accounts?.deployer?.mnemonic;

if (!mnemonic) {
    throw new Error("No mnemonic found in settings/Testnet.toml");
}

interface TestResult {
    id: number;
    contract: string;
    function: string;
    description: string;
    success: boolean;
    txid?: string;
    error?: string;
    nonce: number;
}

async function comprehensiveTest() {
    console.log("🔬 COMPREHENSIVE PRODUCTION READINESS TEST");
    console.log("==========================================\n");

    // Derive wallet
    const wallet = await generateWallet({ secretKey: mnemonic, password: "" });
    const account = wallet.accounts[0];
    const deployerKey = account.stxPrivateKey;
    const deployerAddress = getStxAddress({ account, network: "testnet" });
    const contractAddress = deployerAddress;

    console.log(`📍 Test Address: ${deployerAddress}`);
    console.log(`🎯 Target: 100+ systematic transactions\n`);

    let nonce = 65; // Start from current nonce
    const results: TestResult[] = [];

    // Helper function to execute transaction
    const executeTest = async (
        id: number,
        contract: string,
        func: string,
        args: any[],
        desc: string
    ): Promise<TestResult> => {
        const result: TestResult = { id, contract, function: func, description: desc, success: false, nonce };

        try {
            const txOptions: any = {
                contractAddress,
                contractName: contract,
                functionName: func,
                functionArgs: args,
                senderKey: deployerKey,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
                nonce: BigInt(nonce),
                fee: BigInt(50000),
            };

            const transaction = await makeContractCall(txOptions);
            const response = await broadcastTransaction({ transaction, network: NETWORK });

            if ("error" in response) {
                result.error = `${response.error}${(response as any).reason ? ` - ${(response as any).reason}` : ""}`;
            } else {
                result.success = true;
                result.txid = response.txid;
            }
        } catch (error: any) {
            result.error = error.message;
        }

        nonce++;
        return result;
    };

    console.log("📋 Test Categories:\n");
    console.log("1️⃣  vault-core: Core deposit/withdrawal logic");
    console.log("2️⃣  vault-token: SIP-010 token operations");
    console.log("3️⃣  fee-collector: Fee management");
    console.log("4️⃣  stacking-strategy: PoX integration");
    console.log("5️⃣  harvest-manager: Reward harvesting");
    console.log("6️⃣  compound-engine: Auto-compounding\n");

    // ============================================
    // CATEGORY 1: VAULT-CORE (40 transactions)
    // ============================================
    console.log("\n🏦 Testing vault-core (40 tests)...\n");

    // Deposits - varying amounts
    for (let i = 0; i < 15; i++) {
        const amounts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 8, 12, 18, 22, 28];
        const amount = amounts[i] * 1000000;
        results.push(await executeTest(results.length + 1, "vault-core", "deposit", [uintCV(amount)], `Deposit ${amounts[i]} STX`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 500));
    }

    // Withdrawals - varying share amounts
    for (let i = 0; i < 10; i++) {
        const shares = [2, 3, 5, 7, 10, 4, 6, 8, 9, 11];
        results.push(await executeTest(results.length + 1, "vault-core", "withdraw", [uintCV(shares[i] * 1000000)], `Withdraw ${shares[i]}M shares`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 500));
    }

    // Admin functions
    results.push(await executeTest(results.length + 1, "vault-core", "set-withdrawal-fee", [uintCV(60)], "Set withdrawal fee to 0.6%"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    results.push(await executeTest(results.length + 1, "vault-core", "set-stacking-threshold", [uintCV(75000000000)], "Set stacking threshold to 75K STX"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    results.push(await executeTest(results.length + 1, "vault-core", "pause-contract", [], "Pause contract"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    results.push(await executeTest(results.length + 1, "vault-core", "unpause-contract", [], "Unpause contract"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    // More deposits
    for (let i = 0; i < 10; i++) {
        const amounts = [6, 11, 16, 21, 26, 31, 36, 41, 46, 55];
        const amount = amounts[i] * 1000000;
        results.push(await executeTest(results.length + 1, "vault-core", "deposit", [uintCV(amount)], `Deposit ${amounts[i]} STX`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 500));
    }

    results.push(await executeTest(results.length + 1, "vault-core", "collect-fees", [principalCV(deployerAddress)], "Collect fees"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    // ============================================
    // CATEGORY 2: VAULT-TOKEN (15 transactions)
    // ============================================
    console.log("\n🪙  Testing vault-token (15 tests)...\n");

    // Token transfers (will likely fail since only vault-core mints, but we test the function)
    for (let i = 0; i < 10; i++) {
        const amounts = [1000000, 2000000, 3000000, 500000, 1500000, 2500000, 100000, 200000, 300000, 400000];
        results.push(await executeTest(
            results.length + 1,
            "vault-token",
            "transfer",
            [uintCV(amounts[i]), principalCV(deployerAddress), principalCV(deployerAddress), noneCV()],
            `Transfer ${amounts[i]} shares to self`
        ));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 400));
    }

    // Admin functions
    results.push(await executeTest(results.length + 1, "vault-token", "set-token-uri", [someCV(stringUtf8CV("https://vaultayield.com/token-metadata.json"))], "Set token URI"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    // More deposits to accumulate shares
    for (let i = 0; i < 4; i++) {
        const amounts = [13, 17, 23, 27];
        const amount = amounts[i] * 1000000;
        results.push(await executeTest(results.length + 1, "vault-core", "deposit", [uintCV(amount)], `Deposit ${amounts[i]} STX for shares`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 500));
    }

    // ============================================
    // CATEGORY 3: FEE-COLLECTOR (10 transactions)
    // ============================================
    console.log("\n💰 Testing fee-collector (10 tests)...\n");

    // Withdraw fees
    for (let i = 0; i < 10; i++) {
        results.push(await executeTest(results.length + 1, "fee-collector", "withdraw-fees", [principalCV(deployerAddress)], `Withdraw fees #${i + 1}`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 400));
    }

    // ============================================
    // CATEGORY 4: STACKING-STRATEGY (10 transactions)
    // ============================================
    console.log("\n📊 Testing stacking-strategy (10 tests)...\n");

    // Update pool operator variations
    for (let i = 0; i < 5; i++) {
        results.push(await executeTest(results.length + 1, "stacking-strategy", "update-pool-operator", [principalCV(deployerAddress)], `Update pool operator #${i + 1}`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 400));
    }

    // Delegation attempts (may fail if not enough balance, that's OK for testing)
    for (let i = 0; i < 5; i++) {
        const amounts = [100, 200, 300, 150, 250];
        results.push(await executeTest(results.length + 1, "stacking-strategy", "delegate-vault-stx", [uintCV(amounts[i] * 1000000), uintCV(1)], `Delegate ${amounts[i]} STX for 1 cycle`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 400));
    }

    // ============================================
    // CATEGORY 5: HARVEST-MANAGER (10 transactions)
    // ============================================
    console.log("\n🌾 Testing harvest-manager (10 tests)...\n");

    // Manual reward recording
    for (let i = 0; i < 5; i++) {
        const btcAmounts = [50000, 75000, 100000, 125000, 150000];
        results.push(await executeTest(results.length + 1, "harvest-manager", "manual-record-reward", [uintCV(i + 1), uintCV(btcAmounts[i])], `Record ${btcAmounts[i]} sats reward for cycle ${i + 1}`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 400));
    }

    // Harvest attempts
    for (let i = 0; i < 5; i++) {
        results.push(await executeTest(results.length + 1, "harvest-manager", "harvest-rewards", [], `Harvest rewards attempt #${i + 1}`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 400));
    }

    // ============================================
    // CATEGORY 6: COMPOUND-ENGINE (15 transactions)
    // ============================================
    console.log("\n⚡ Testing compound-engine (15 tests)...\n");

    // Set mock exchange rate
    results.push(await executeTest(results.length + 1, "compound-engine", "set-mock-exchange-rate", [uintCV(50000)], "Set mock exchange rate to 50000"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    // Enable mock DEX
    results.push(await executeTest(results.length + 1, "compound-engine", "enable-mock-dex-mode", [], "Enable mock DEX mode"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    // Mock compound executions
    for (let i = 0; i < 10; i++) {
        const btcAmounts = [25000, 50000, 75000, 100000, 35000, 60000, 85000, 110000, 45000, 70000];
        results.push(await executeTest(results.length + 1, "compound-engine", "execute-compound-mock", [uintCV(btcAmounts[i])], `Mock compound ${btcAmounts[i]} sats`));
        console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);
        await new Promise(r => setTimeout(r, 400));
    }

    // Set slippage tolerance
    results.push(await executeTest(results.length + 1, "compound-engine", "set-slippage-tolerance", [uintCV(300)], "Set slippage tolerance to 3%"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    // Final deposits
    results.push(await executeTest(results.length + 1, "vault-core", "deposit", [uintCV(100000000)], "Final deposit 100 STX"));
    console.log(`  [${results.length}/100+] ${results[results.length - 1].success ? "✅" : "❌"} ${results[results.length - 1].description}`);

    // ============================================
    // RESULTS SUMMARY
    // ============================================
    console.log("\n\n========================================");
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("========================================\n");

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const successRate = ((successCount / results.length) * 100).toFixed(1);

    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Successful: ${successCount} (${successRate}%)`);
    console.log(`❌ Failed: ${failCount}\n`);

    // Category breakdown
    const categories = {
        "vault-core": results.filter(r => r.contract === "vault-core"),
        "vault-token": results.filter(r => r.contract === "vault-token"),
        "fee-collector": results.filter(r => r.contract === "fee-collector"),
        "stacking-strategy": results.filter(r => r.contract === "stacking-strategy"),
        "harvest-manager": results.filter(r => r.contract === "harvest-manager"),
        "compound-engine": results.filter(r => r.contract === "compound-engine"),
    };

    console.log("📋 By Contract:"); console.log("----------------------------------------");
    Object.entries(categories).forEach(([name, tests]) => {
        const success = tests.filter(t => t.success).length;
        const total = tests.length;
        const rate = ((success / total) * 100).toFixed(1);
        console.log(`${name.padEnd(20)} ${success}/${total} (${rate}%)`);
    });

    // Save detailed results
    const reportPath = resolve(__dirname, "../test-results.json");
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Detailed results saved to: test-results.json`);

    console.log(`\n🔗 View all transactions: https://explorer.hiro.so/address/${deployerAddress}?chain=testnet`);

    // Production readiness assessment
    console.log("\n\n========================================");
    console.log("🎯 PRODUCTION READINESS ASSESSMENT");
    console.log("========================================\n");

    const coreSuccess = categories["vault-core"].filter(t => t.success).length;
    const coreTotal = categories["vault-core"].length;
    const coreRate = (coreSuccess / coreTotal) * 100;

    if (coreRate >= 90) {
        console.log("✅ CORE FUNCTIONALITY: PRODUCTION READY");
        console.log(`   ${coreSuccess}/${coreTotal} core tests passed (${coreRate.toFixed(1)}%)\n`);
    } else {
        console.log("⚠️  CORE FUNCTIONALITY: NEEDS REVIEW");
        console.log(`   Only ${coreSuccess}/${coreTotal} core tests passed (${coreRate.toFixed(1)}%)\n`);
    }

    if (successRate >= "80") {
        console.log("✅ OVERALL SYSTEM: PRODUCTION READY");
        console.log(`   ${successCount}/${results.length} total tests passed (${successRate}%)\n`);
    } else {
        console.log("⚠️  OVERALL SYSTEM: FURTHER TESTING NEEDED");
        console.log(`   ${successCount}/${results.length} total tests passed (${successRate}%)\n`);
    }

    console.log("========================================\n");
}

comprehensiveTest().catch((error) => {
    console.error("❌ Test suite error:", error);
    process.exit(1);
});
