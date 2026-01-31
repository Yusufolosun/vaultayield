import { makeContractCall, broadcastTransaction, AnchorMode, contractPrincipalCV } from "@stacks/transactions";
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

async function configure() {
    console.log("🔧 Configuring VaultaYield Contracts on Testnet\n");

    // Derive wallet
    const wallet = await generateWallet({
        secretKey: mnemonic,
        password: "",
    });

    const account = wallet.accounts[0];
    const deployerKey = account.stxPrivateKey;
    const deployerAddress = getStxAddress({ account, network: "testnet" });

    console.log(`📍 Deployer: ${deployerAddress}\n`);

    const contractAddress = deployerAddress;
    let nonce = 29; // Start from next available nonce

    // Configuration calls
    const configs = [
        {
            contract: "vault-core",
            function: "set-vault-token",
            contractName: "vault-token",
            description: "Setting vault token reference",
        },
        {
            contract: "vault-core",
            function: "set-fee-collector",
            contractName: "fee-collector",
            description: "Setting fee collector reference",
        },
        {
            contract: "vault-core",
            function: "set-stacking-strategy",
            contractName: "stacking-strategy",
            description: "Setting stacking strategy reference",
        },
        {
            contract: "stacking-strategy",
            function: "set-vault-core",
            contractName: "vault-core",
            description: "Linking stacking strategy to vault core",
        },
        {
            contract: "fee-collector",
            function: "set-vault-core",
            contractName: "vault-core",
            description: "Linking fee collector to vault core",
        },
        {
            contract: "vault-core",
            function: "enable-stacking",
            contractName: null,
            description: "Enabling stacking feature",
        },
    ];

    for (const cfg of configs) {
        console.log(`📄 ${cfg.description}...`);

        try {
            const txOptions: any = {
                contractAddress,
                contractName: cfg.contract,
                functionName: cfg.function,
                functionArgs: cfg.contractName
                    ? [contractPrincipalCV(contractAddress, cfg.contractName)]
                    : [],
                senderKey: deployerKey,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
                nonce: BigInt(nonce),
                fee: BigInt(100000), // 0.1 STX
            };

            const transaction = await makeContractCall(txOptions);
            const response = await broadcastTransaction({ transaction, network: NETWORK });

            if ("error" in response) {
                console.log(`   ❌ Failed: ${response.error}`);
                if ((response as any).reason) {
                    console.log(`   Reason: ${(response as any).reason}`);
                }
            } else {
                console.log(`   ✅ TxID: ${response.txid}`);
                console.log(`   🔗 https://explorer.hiro.so/txid/${response.txid}?chain=testnet\n`);
            }

            nonce++;
        } catch (error: any) {
            console.error(`   ❌ Error: ${error.message}\n`);
        }

        // Brief delay between transactions
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n✅ Configuration complete!\n");
    console.log("Next: Test deposit/withdrawal functionality");
}

configure().catch(console.error);
