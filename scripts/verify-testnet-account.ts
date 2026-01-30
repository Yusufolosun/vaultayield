import { generateWallet, getStxAddress } from "@stacks/wallet-sdk";
import { TransactionVersion } from "@stacks/transactions";
import * as fs from "fs";
import * as toml from "toml";

// Read Testnet.toml
const testnetConfig = toml.parse(
    fs.readFileSync("settings/Testnet.toml", "utf-8")
);

const mnemonic = testnetConfig.accounts.deployer.mnemonic;

if (!mnemonic) {
    console.error("❌ No mnemonic found in settings/Testnet.toml");
    process.exit(1);
}

console.log("🔍 Deriving address from your mnemonic...\n");

// Generate wallet from mnemonic
(async () => {
    try {
        const wallet = await generateWallet({
            secretKey: mnemonic,
            password: "",
        });

        const account = wallet.accounts[0];

        // Get testnet address
        const testnetAddress = getStxAddress({
            account,
            transactionVersion: TransactionVersion.Testnet,
        });

        // Get mainnet address for reference
        const mainnetAddress = getStxAddress({
            account,
            transactionVersion: TransactionVersion.Mainnet,
        });

        console.log("✅ Address Derivation Complete:");
        console.log("================================");
        console.log(`Testnet Address: ${testnetAddress}`);
        console.log(`Mainnet Address: ${mainnetAddress}`);
        console.log("\n📝 Expected by deployment plan:");
        console.log(`Expected Address: ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0`);

        if (testnetAddress === "ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0") {
            console.log("\n✅ MATCH! Your mnemonic is correct");
        } else {
            console.log("\n❌ MISMATCH! Your mnemonic derives to a different address");
            console.log(
                "\nThis means the mnemonic in settings/Testnet.toml is not the one you think it is."
            );
        }

        console.log("\n🔗 Check balance on explorer:");
        console.log(`https://explorer.hiro.so/address/${testnetAddress}?chain=testnet`);
        console.log(
            "\nIf balance is 0, request STX from faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet"
        );
    } catch (error) {
        console.error("❌ Error:", error);
    }
})();
