/**
 * VaultaYield Mainnet Deployment Script
 * 
 * ⚠️ CRITICAL WARNINGS:
 * 1. This deploys to MAINNET with REAL STX
 * 2. Triple-check all contract code before running
 * 3. Have ~15 STX in deployment wallet
 * 4. Backup your private key securely
 * 5. Test configuration on testnet first
 * 
 * Usage:
 *   SET DEPLOYER_PRIVATE_KEY=your_key
 *   npm run deploy:mainnet
 */

import {
    makeContractDeploy,
    broadcastTransaction,
    AnchorMode,
    getAddressFromPrivateKey,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import * as fs from 'fs';
import * as path from 'path';

// ========================================
// CONFIGURATION
// ========================================

const NETWORK = STACKS_MAINNET;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

if (!DEPLOYER_KEY) {
    console.error('❌ ERROR: DEPLOYER_PRIVATE_KEY environment variable not set');
    console.error('Set it with: SET DEPLOYER_PRIVATE_KEY=your_key');
    process.exit(1);
}

// Deployment configuration
const CONTRACTS_TO_DEPLOY = [
    'vault-token',
    'fee-collector',
    'stacking-strategy',
    'harvest-manager',
    'compound-engine',
    'vault-core',
];

const DEPLOYMENT_DELAY = 60000; // 60 seconds between deployments
const MAX_RETRIES = 3;

// ========================================
// DEPLOYMENT RECORD TRACKING
// ========================================

interface DeploymentRecord {
    timestamp: string;
    network: string;
    deployer: string;
    contracts: Array<{
        name: string;
        address: string;
        txId: string;
        nonce: number;
        status: 'pending' | 'success' | 'failed';
        blockHeight?: number;
    }>;
}

let deploymentRecord: DeploymentRecord = {
    timestamp: new Date().toISOString(),
    network: 'mainnet',
    deployer: '',
    contracts: [],
};

// ========================================
// HELPER FUNCTIONS
// ========================================

async function getNextNonce(address: string): Promise<number> {
    try {
        const response = await fetch(`${NETWORK.coreApiUrl}/extended/v1/address/${address}/nonces`);
        const data = await response.json();
        return data.possible_next_nonce || 0;
    } catch (error) {
        console.error('⚠️  Warning: Could not fetch nonce from API');
        console.error('Manual nonce required. Check explorer and update script.');
        throw error;
    }
}

function readContract(contractName: string): string {
    const filePath = path.join(__dirname, '..', 'contracts', `${contractName}.clar`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Contract file not found: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf-8');
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function deployContract(
    contractName: string,
    nonce: number,
    retryCount: number = 0
): Promise<{ txId: string; success: boolean }> {

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Deploying: ${contractName}`);
    console.log(`Nonce: ${nonce}`);
    console.log(`Attempt: ${retryCount + 1}/${MAX_RETRIES}`);
    console.log('='.repeat(60));

    try {
        // Read contract code
        const codeBody = readContract(contractName);
        console.log(`✅ Contract code loaded (${codeBody.length} chars)`);

        // Create deployment transaction
        const txOptions: any = {
            contractName,
            codeBody,
            senderKey: DEPLOYER_KEY,
            network: NETWORK,
            anchorMode: AnchorMode.Any,
            nonce: BigInt(nonce),
            fee: BigInt(500000), // 0.5 STX fee (mainnet requires higher fees)
            clarityVersion: 2, // CRITICAL: Use Clarity 2
        };

        const transaction = await makeContractDeploy(txOptions);
        console.log('✅ Transaction created');

        // Broadcast to network
        console.log('📡 Broadcasting to mainnet...');
        const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });

        if ('error' in broadcastResponse) {
            throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
        }

        const txId = broadcastResponse.txid;
        console.log(`✅ DEPLOYED SUCCESSFULLY`);
        console.log(`📋 TxID: ${txId}`);
        console.log(`🔗 Explorer: https://explorer.hiro.so/txid/${txId}?chain=mainnet`);

        return { txId, success: true };

    } catch (error: any) {
        console.error(`❌ Deployment failed:`, error.message);

        // Retry logic
        if (retryCount < MAX_RETRIES - 1) {
            console.log(`⏳ Retrying in 30 seconds...`);
            await sleep(30000);
            return deployContract(contractName, nonce, retryCount + 1);
        }

        return { txId: '', success: false };
    }
}

// ========================================
// MAIN DEPLOYMENT FUNCTION
// ========================================

async function deployAllContracts() {
    console.log('\n🚀 VaultaYield Mainnet Deployment Starting...\n');
    console.log('⚠️  WARNING: Deploying to MAINNET with REAL STX');
    console.log('Network:', NETWORK.coreApiUrl);

    // Get deployer address
    const deployerAddress = getAddressFromPrivateKey(DEPLOYER_KEY, NETWORK.version);
    deploymentRecord.deployer = deployerAddress;

    console.log('Deployer:', deployerAddress);
    console.log('\n⏰ Starting in 10 seconds... (Ctrl+C to cancel)\n');
    await sleep(10000);

    // Get starting nonce
    let currentNonce: number;
    try {
        currentNonce = await getNextNonce(deployerAddress);
        console.log(`Starting nonce: ${currentNonce}\n`);
    } catch (error) {
        console.error('Failed to get nonce. Please check network connection.');
        process.exit(1);
    }

    // Deploy each contract
    for (const contractName of CONTRACTS_TO_DEPLOY) {
        const result = await deployContract(contractName, currentNonce);

        // Record deployment
        deploymentRecord.contracts.push({
            name: contractName,
            address: `${deployerAddress}.${contractName}`,
            txId: result.txId,
            nonce: currentNonce,
            status: result.success ? 'pending' : 'failed',
        });

        if (result.success) {
            currentNonce++; // Increment nonce for next deployment

            // Save deployment record after each successful deployment
            fs.writeFileSync(
                'deployment-mainnet.json',
                JSON.stringify(deploymentRecord, null, 2)
            );

            // Wait before next deployment (let mempool clear)
            if (contractName !== CONTRACTS_TO_DEPLOY[CONTRACTS_TO_DEPLOY.length - 1]) {
                console.log(`\n⏳ Waiting ${DEPLOYMENT_DELAY / 1000}s before next deployment...\n`);
                await sleep(DEPLOYMENT_DELAY);
            }
        } else {
            console.error(`\n❌ CRITICAL: ${contractName} deployment failed`);
            console.error('Stopping deployment process');
            break;
        }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));

    const successful = deploymentRecord.contracts.filter(c => c.status !== 'failed');
    const failed = deploymentRecord.contracts.filter(c => c.status === 'failed');

    console.log(`✅ Successful: ${successful.length}/${CONTRACTS_TO_DEPLOY.length}`);
    console.log(`❌ Failed: ${failed.length}/${CONTRACTS_TO_DEPLOY.length}`);

    if (successful.length > 0) {
        console.log('\n✅ Deployed Contracts:');
        successful.forEach(c => {
            console.log(`  - ${c.name}: ${c.address}`);
            console.log(`    TxID: ${c.txId}`);
        });
    }

    if (failed.length > 0) {
        console.log('\n❌ Failed Deployments:');
        failed.forEach(c => {
            console.log(`  - ${c.name}`);
        });
    }

    console.log('\n📝 Full deployment record saved to: deployment-mainnet.json');
    console.log('\n🔗 View deployer: https://explorer.hiro.so/address/' + deployerAddress + '?chain=mainnet');

    if (successful.length === CONTRACTS_TO_DEPLOY.length) {
        console.log('\n✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY!');
        console.log('\n📌 NEXT STEPS:');
        console.log('1. Verify all transactions confirmed on explorer');
        console.log('2. Run configuration script: npm run configure:mainnet');
        console.log('3. Verify configuration');
        console.log('4. Make first deposit to initialize share price');
    }
}

// ========================================
// EXECUTE DEPLOYMENT
// ========================================

deployAllContracts()
    .then(() => {
        console.log('\n✅ Deployment process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Deployment process failed:', error);
        process.exit(1);
    });
