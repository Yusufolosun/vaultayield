import { makeContractCall, broadcastTransaction, AnchorMode, uintCV } from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network";
import { parse as tomlParse } from "toml";
import { readFileSync } from "fs";
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

async function generateTransactions() {
    console.log("🚀 Generating 30 On-Chain Transactions on Testnet\n");

    // Derive wallet
    const wallet = await generateWallet({
        secretKey: mnemonic,
        password: "",
    });

    const account = wallet.accounts[0];
    const deployerKey = account.stxPrivateKey;
    const deployerAddress = getStxAddress({ account, network: "testnet" });

    console.log(`📍 Address: ${deployerAddress}\n`);

    const contractAddress = deployerAddress;
    let nonce = 35; // Start from next available nonce (after config transactions)
    let successCount = 0;
    let failCount = 0;

    // Generate 30 transactions with different operations
    const transactions = [
        // 10 Deposits of varying amounts
        { contract: "vault-core", function: "deposit", args: [uintCV(10000000)], desc: "Deposit 10 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(25000000)], desc: "Deposit 25 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(50000000)], desc: "Deposit 50 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(5000000)], desc: "Deposit 5 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(15000000)], desc: "Deposit 15 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(30000000)], desc: "Deposit 30 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(20000000)], desc: "Deposit 20 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(8000000)], desc: "Deposit 8 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(12000000)], desc: "Deposit 12 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(18000000)], desc: "Deposit 18 STX" },

        // 10 Withdrawals (using expected share amounts)
        { contract: "vault-core", function: "withdraw", args: [uintCV(5000000)], desc: "Withdraw 5M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(3000000)], desc: "Withdraw 3M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(10000000)], desc: "Withdraw 10M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(2000000)], desc: "Withdraw 2M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(8000000)], desc: "Withdraw 8M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(4000000)], desc: "Withdraw 4M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(6000000)], desc: "Withdraw 6M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(7000000)], desc: "Withdraw 7M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(9000000)], desc: "Withdraw 9M shares" },
        { contract: "vault-core", function: "withdraw", args: [uintCV(11000000)], desc: "Withdraw 11M shares" },

        // 5 More deposits
        { contract: "vault-core", function: "deposit", args: [uintCV(40000000)], desc: "Deposit 40 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(22000000)], desc: "Deposit 22 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(35000000)], desc: "Deposit 35 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(28000000)], desc: "Deposit 28 STX" },
        { contract: "vault-core", function: "deposit", args: [uintCV(16000000)], desc: "Deposit 16 STX" },

        // 5 Configuration/Admin calls (some may fail, that's OK)
        { contract: "vault-core", function: "set-stacking-threshold", args: [uintCV(50000000000)], desc: "Set stacking threshold to 50K STX" },
        { contract: "vault-core", function: "pause-contract", args: [], desc: "Pause contract" },
        { contract: "vault-core", function: "unpause-contract", args: [], desc: "Unpause contract" },
        { contract: "vault-core", function: "set-withdrawal-fee", args: [uintCV(75)], desc: "Set withdrawal fee to 0.75%" },
        { contract: "vault-core", function: "enable-stacking", args: [], desc: "Enable stacking (again)" },
    ];

    console.log(`📦 Broadcasting ${transactions.length} transactions...\n`);

    for (let i = 0; i < transactions.length; i++) {
        const tx = transactions[i];
        const txNum = i + 1;

        console.log(`[${txNum}/30] ${tx.desc}...`);

        try {
            const txOptions: any = {
                contractAddress,
                contractName: tx.contract,
                functionName: tx.function,
                functionArgs: tx.args,
                senderKey: deployerKey,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
                nonce: BigInt(nonce),
                fee: BigInt(50000), // 0.05 STX fee
            };

            const transaction = await makeContractCall(txOptions);
            const response = await broadcastTransaction({ transaction, network: NETWORK });

            if ("error" in response) {
                console.log(`   ❌ Failed: ${response.error}`);
                if ((response as any).reason) {
                    console.log(`   Reason: ${(response as any).reason}`);
                }
                failCount++;
            } else {
                console.log(`   ✅ TxID: ${response.txid.substring(0, 16)}...`);
                successCount++;
            }

            nonce++;
        } catch (error: any) {
            console.error(`   ❌ Error: ${error.message}`);
            failCount++;
        }

        // Brief delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("\n========================================");
    console.log("📊 Transaction Summary");
    console.log("========================================");
    console.log(`Total Attempted: ${transactions.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log("========================================\n");

    console.log(`🔗 View transactions: https://explorer.hiro.so/address/${deployerAddress}?chain=testnet\n`);
}

generateTransactions().catch((error) => {
    console.error("❌ Script error:", error);
    process.exit(1);
});
