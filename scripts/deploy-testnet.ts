import { StacksTestnet } from "@stacks/network";
import {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
} from "@stacks/transactions";
import { readFileSync } from "fs";
import * as path from "path";

// ========================================
// CONFIGURATION
// ========================================

const NETWORK = new StacksTestnet();

// IMPORTANT: Set your private key here or use environment variable
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

if (!DEPLOYER_KEY) {
    console.error("❌ Error: DEPLOYER_PRIVATE_KEY environment variable not set");
    console.log("Set it with: export DEPLOYER_PRIVATE_KEY=your_testnet_private_key");
    process.exit(1);
}

// Contract deployment order (dependencies first)
const CONTRACTS = [
    { name: "vault-token", path: "contracts/vault-token.clar" },
    { name: "fee-collector", path: "contracts/fee-collector.clar" },
    { name: "stacking-strategy", path: "contracts/stacking-strategy.clar" },
    { name: "harvest-manager", path: "contracts/harvest-manager.clar" },
    { name: "compound-engine", path: "contracts/compound-engine.clar" },
    { name: "vault-core", path: "contracts/vault-core.clar" },
];

// ========================================
// DEPLOYMENT FUNCTIONS
// ========================================

async function deployContract(
    contractName: string,
    contractPath: string,
    nonce: number
): Promise<string> {
    try {
        console.log(`\n📄 Deploying ${contractName}...`);

        // Read contract source
        const codeBody = readFileSync(path.resolve(contractPath), "utf8");

        // Create deployment transaction
        const txOptions = {
            contractName,
            codeBody,
            senderKey: DEPLOYER_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
            nonce: BigInt(nonce),
            fee: BigInt(250000), // 0.25 STX fee
        };

        const transaction = await makeContractDeploy(txOptions);

        // Broadcast transaction
        const broadcastResponse = await broadcastTransaction(transaction, NETWORK);

        if ("error" in broadcastResponse) {
            throw new Error(
                `Broadcast error: ${broadcastResponse.error} - ${JSON.stringify(
                    broadcastResponse
                )}`
            );
        }

        const txId = broadcastResponse.txid;
        console.log(`✅ ${contractName} deployed!`);
        console.log(`   TxID: ${txId}`);
        console.log(
            `   Explorer: https://explorer.hiro.so/txid/${txId}?chain=testnet`
        );

        return txId;
    } catch (error) {
        console.error(`❌ Error deploying ${contractName}:`, error);
        throw error;
    }
}

async function waitForConfirmation(txId: string): Promise<void> {
    console.log(`⏳ Waiting for confirmation...`);

    const maxAttempts = 30;
    const delayMs = 10000; // 10 seconds

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        try {
            const response = await fetch(
                `https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`
            );
            const data = await response.json();

            if (data.tx_status === "success") {
                console.log(`✅ Transaction confirmed!`);
                return;
            } else if (data.tx_status === "abort_by_response") {
                throw new Error(`Transaction aborted: ${data.tx_result}`);
            }

            console.log(
                `   Attempt ${i + 1}/${maxAttempts}: Status = ${data.tx_status}`
            );
        } catch (error) {
            console.log(
                `   Attempt ${i + 1}/${maxAttempts}: Checking transaction...`
            );
        }
    }

    throw new Error("Transaction confirmation timeout");
}

// ========================================
// MAIN DEPLOYMENT SCRIPT
// ========================================

async function main() {
    console.log("========================================");
    console.log("🚀 VaultaYield Testnet Deployment");
    console.log("========================================");
    console.log(`Network: Stacks Testnet`);
    console.log(`Total Contracts: ${CONTRACTS.length}`);
    console.log("========================================\n");

    const deployedContracts: Array<{ name: string; txId: string }> = [];

    try {
        // Get deployer account nonce
        let nonce = 0;

        // Deploy each contract
        for (const contract of CONTRACTS) {
            const txId = await deployContract(contract.name, contract.path, nonce);
            deployedContracts.push({ name: contract.name, txId });

            // Wait for confirmation before deploying next contract
            await waitForConfirmation(txId);

            nonce++;

            // Brief delay between contracts
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        console.log("\n========================================");
        console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
        console.log("========================================");

        console.log("\n📋 Deployment Summary:");
        deployedContracts.forEach(({ name, txId }) => {
            console.log(`\n  ${name}:`);
            console.log(`    TxID: ${txId}`);
            console.log(`    Explorer: https://explorer.hiro.so/txid/${txId}?chain=testnet`);
        });

        console.log("\n========================================");
        console.log("⚙️  NEXT STEPS:");
        console.log("========================================");
        console.log("1. Verify contracts on Stacks Explorer");
        console.log("2. Configure vault-core with Phase 2 contract addresses:");
        console.log("   - set-stacking-strategy");
        console.log("   - set-harvest-manager");
        console.log("   - set-compound-engine");
        console.log("   - enable-stacking");
        console.log("3. Run testnet integration tests");
        console.log("4. Test deposit-with-stacking functionality");
        console.log("========================================\n");

        // Save deployment info
        const deploymentInfo = {
            network: "testnet",
            timestamp: new Date().toISOString(),
            contracts: deployedContracts,
        };

        const fs = require("fs");
        fs.writeFileSync(
            "deployment-testnet.json",
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("💾 Deployment info saved to deployment-testnet.json\n");
    } catch (error) {
        console.error("\n❌ Deployment failed:", error);
        console.log("\n📋 Partial deployment:");
        deployedContracts.forEach(({ name, txId }) => {
            console.log(`  ✅ ${name}: ${txId}`);
        });
        process.exit(1);
    }
}

// Run deployment
main();
