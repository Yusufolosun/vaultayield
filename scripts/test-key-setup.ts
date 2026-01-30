import * as dotenv from 'dotenv';
dotenv.config();

// ========================================
// KEY SETUP VERIFICATION SCRIPT
// ========================================

console.log("🔐 VaultaYield Key Setup Verification\n");
console.log("========================================\n");

// Check if .env file exists
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!privateKey) {
    console.error("❌ ERROR: DEPLOYER_PRIVATE_KEY not found");
    console.log("\n📝 Steps to fix:");
    console.log("1. Copy .env.example to .env");
    console.log("   cp .env.example .env");
    console.log("2. Edit .env and add your private key");
    console.log("3. Run this script again\n");
    process.exit(1);
}

// Validate private key format
let isValid = true;
const errors: string[] = [];

if (privateKey.length !== 64) {
    isValid = false;
    errors.push(`Invalid length: ${privateKey.length} (expected 64 characters)`);
}

if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
    isValid = false;
    errors.push("Invalid format: must be 64 hexadecimal characters (0-9, a-f)");
}

if (privateKey === "your_private_key_here") {
    isValid = false;
    errors.push("Placeholder value detected: Replace with your actual private key");
}

// Display results
if (!isValid) {
    console.log("❌ VALIDATION FAILED\n");
    errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
    });
    console.log("\n");
    process.exit(1);
}

// Success!
console.log("✅ Private key loaded successfully");
console.log("✅ Key length: 64 characters");
console.log("✅ Format: Valid hexadecimal");
console.log(`\n🔐 Key preview: ${privateKey.substring(0, 8)}...${privateKey.substring(56)}`);

// Additional checks
console.log("\n========================================");
console.log("📋 Environment Configuration:");
console.log("========================================");
console.log(`Network: ${process.env.NETWORK || 'testnet'}`);
console.log(`API URL: ${process.env.STACKS_API_URL || 'https://stacks-node-api.testnet.stacks.co'}`);
console.log(`TX Fee: ${process.env.TX_FEE || '250000'} microSTX`);
console.log(`Verbose: ${process.env.VERBOSE_LOGGING || 'true'}`);

console.log("\n========================================");
console.log("✨ Setup Complete!");
console.log("========================================");
console.log("\n📝 Next steps:");
console.log("1. Ensure you have testnet STX in your wallet");
console.log("2. Run: npx ts-node scripts/deploy-testnet.ts");
console.log("\n");
