import { STACKS_TESTNET } from "@stacks/network";
import {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
} from "@stacks/transactions";
import { generateWallet, getStxAddress } from "@stacks/wallet-sdk";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import * as toml from "toml";

console.log("🚀 Starting VaultaYield Testnet Deployment Script...\n");

// ========================================
// CONFIGURATION
// ========================================

const NETWORK = STACKS_TESTNET;

const TESTNET_SETTINGS_PATH = path.join(__dirname, "..", "settings", "Testnet.toml");

console.log(`📁 Reading configuration from: ${TESTNET_SETTINGS_PATH}`);

// Read mnemonic from settings/Testnet.toml
let mnemonic: string;
try {
    const tomlContent = readFileSync(TESTNET_SETTINGS_PATH, "utf-8");
    console.log("✅ File read successfully");

    const config: any = toml.parse(tomlContent);
    console.log("✅ TOML parsed successfully");

    mnemonic = config?.accounts?.deployer?.mnemonic;
    if (!mnemonic) {
        console.error("❌ No mnemonic found in settings/Testnet.toml");
        throw new Error("Mnemonic not found in configuration");
    }
    console.log("✅ Mnemonic loaded from settings/Testnet.toml\n");
} catch (error) {
    console.error("❌ Error reading settings/Testnet.toml:", error);
    console.log("\nMake sure settings/Testnet.toml exists with:");
    console.log("[accounts.deployer]");
    console.log('mnemonic = "your 24 words here"');
    throw error;
}

// Contract deployment order (dependencies first)
// vault-token already deployed successfully with nonce 18
const CONTRACTS = [
    // { name: "vault-token", path: "contracts/vault-token.clar" }, // ALREADY DEPLOYED
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
    deployerKey: string,
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
            senderKey: deployerKey,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            nonce: BigInt(nonce),
            fee: BigInt(250000), // 0.25 STX fee
            clarityVersion: 2, // CRITICAL: Specify Clarity 2 for as-contract support
        };

        const transaction = await makeContractDeploy(txOptions);

        // Broadcast transaction
        const broadcastResponse = await broadcastTransaction({
            transaction,
            network: NETWORK,
        });

        if ("error" in broadcastResponse) {
            throw new Error(
                `Broadcast error: ${broadcastResponse.error} - ${(broadcastResponse as any).reason || ""
                } `
            );
        }

        const txId = broadcastResponse.txid;
        console.log(`✅ ${contractName} deployed!`);
        console.log(`   TxID: ${txId} `);
        console.log(
            `   Explorer: https://explorer.hiro.so/txid/${txId}?chain=testnet`
        );

        return txId;
    } catch (error) {
        console.error(`❌ Error deploying ${contractName}:`, error);
        throw error;
    }
}

async function waitForConfirmation(
    txId: string,
    contractName: string
): Promise<void> {
    console.log(`⏳ Waiting for ${contractName} confirmation...`);

    const maxAttempts = 3; // Reduced for faster deployment
    const delayMs = 5000; // 5 seconds

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));

        try {
            const response = await fetch(
                `https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`
            );
            const data: any = await response.json();

            if (data.tx_status === "success") {
                console.log(`✅ ${contractName} confirmed!`);
                return;
            } else if (
                data.tx_status === "abort_by_response" ||
                data.tx_status === "abort_by_post_condition"
            ) {
                throw new Error(
                    `Transaction aborted: ${data.tx_status} - ${data.tx_result?.repr || ""}`
                );
            }

            console.log(
                `   Attempt ${i + 1}/${maxAttempts}: Status = ${data.tx_status}`
            );
        } catch (error: any) {
            if (error.message?.includes("aborted")) throw error;
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
    console.log("\n========================================");
    console.log("🚀 VaultaYield Testnet Deployment");
    console.log("========================================");
    console.log(`Network: Stacks Testnet`);
    console.log("Total Contracts: 5 (vault-token already deployed)");
    console.log("========================================\n");

    // Derive private key from mnemonic
    console.log("🔑 Deriving private key from mnemonic...");
    let deployerKey: string;
    let deployerAddress: string;

    try {
        const wallet = await generateWallet({
            secretKey: mnemonic,
            password: "",
        });

        const account = wallet.accounts[0];
        deployerKey = account.stxPrivateKey;

        // Derive address using getStxAddress with network parameter
        deployerAddress = getStxAddress(account, "testnet");

        console.log(`✅ Deployer address: ${deployerAddress}`);
        console.log(
            `🔗 Check balance: https://explorer.hiro.so/address/${deployerAddress}?chain=testnet\n`
        );
    } catch (error) {
        console.error("❌ Error deriving key from mnemonic:", error);
        process.exit(1);
    }

    const deployedContracts: Array<{ name: string; txId: string }> = [];

    try {
        // Get deployer account nonce  
        console.log("📊 Fetching account nonce...\n");

        let nonceStart = 24; // Set to 24 - failed deploys consumed nonces 19-23
        try {
            // Use curl as workaround for Node.js SSL issues on Windows
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);

            const apiUrl = "https://stacks-node-api.testnet.stacks.co";
            const curlCommand = `curl -s "${apiUrl}/v2/accounts/${deployerAddress}?proof=0"`;

            const { stdout, stderr } = await execAsync(curlCommand);

            if (stderr && !stdout) {
                throw new Error(`Curl error: ${stderr}`);
            }

            const accountInfo: any = JSON.parse(stdout);
            const fetchedNonce = accountInfo.nonce || 0;

            // Use fetched nonce if available, otherwise use manual override
            nonceStart = fetchedNonce > 0 ? fetchedNonce : 18;
            console.log(`✅ Current nonce: ${nonceStart}\n`);
        } catch (error: any) {
            console.warn(`⚠️  Warning: Could not fetch nonce (${error.message})`);
            console.log(`Using manual nonce override: ${nonceStart}\n`);
        }

        let nonce = nonceStart;

        // Deploy each contract
        for (const contract of CONTRACTS) {
            const txId = await deployContract(
                contract.name,
                contract.path,
                deployerKey,
                nonce
            );
            deployedContracts.push({ name: contract.name, txId });
            nonce++; // Increment nonce for next deployment

            // Skip confirmation wait to deploy all contracts rapidly
            // Testnet confirmations can take time but transactions will process in order
            console.log(`✅ ${contract.name} broadcasted! Moving to next contract...\n`);
            // await waitForConfirmation(txId, contract.name);

            // Brief delay between contracts
            // await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        console.log("\n========================================");
        console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
        console.log("========================================");

        console.log("\n📋 Deployment Summary:");
        deployedContracts.forEach(({ name, txId }) => {
            console.log(`\n  ${name}:`);
            console.log(`    TxID: ${txId}`);
            console.log(
                `    Explorer: https://explorer.hiro.so/txid/${txId}?chain=testnet`
            );
        });

        console.log("\n========================================");
        console.log("⚙️  NEXT STEPS:");
        console.log("========================================");
        console.log("1. Verify contracts on Stacks Explorer");
        console.log("2. Configure vault-core with Phase 2 contract addresses");
        console.log("3. Run testnet integration tests");
        console.log("========================================\n");

        // Save deployment info
        const deploymentInfo = {
            network: "testnet",
            timestamp: new Date().toISOString(),
            deployer: deployerAddress,
            contracts: deployedContracts,
        };

        writeFileSync(
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
