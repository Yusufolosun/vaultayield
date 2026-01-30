/**
 * VaultaYield Mainnet Configuration Script
 * 
 * Links deployed contracts together
 * 
 * Run AFTER all contracts deployed successfully
 * 
 * Usage:
 *   SET DEPLOYER_PRIVATE_KEY=your_key
 *   npm run configure:mainnet
 */

import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    contractPrincipalCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import * as fs from 'fs';

const NETWORK = STACKS_MAINNET;
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

if (!DEPLOYER_KEY) {
    console.error('❌ ERROR: DEPLOYER_PRIVATE_KEY environment variable not set');
    process.exit(1);
}

// Load deployment record
if (!fs.existsSync('deployment-mainnet.json')) {
    console.error('❌ ERROR: deployment-mainnet.json not found');
    console.error('Please run deploy-mainnet.ts first');
    process.exit(1);
}

const deploymentRecord = JSON.parse(
    fs.readFileSync('deployment-mainnet.json', 'utf-8')
);

const DEPLOYER_ADDRESS = deploymentRecord.deployer;

// ========================================
// CONFIGURATION STEPS
// ========================================

interface ConfigStep {
    contract: string;
    function: string;
    args: any[];
    description: string;
}

const CONFIG_STEPS: ConfigStep[] = [
    {
        contract: 'vault-token',
        function: 'set-vault-core',
        args: [contractPrincipalCV(DEPLOYER_ADDRESS, 'vault-core')],
        description: 'Set vault-core as authorized minter for vault-token',
    },
    {
        contract: 'fee-collector',
        function: 'set-vault-core',
        args: [contractPrincipalCV(DEPLOYER_ADDRESS, 'vault-core')],
        description: 'Set vault-core as authorized caller for fee-collector',
    },
    {
        contract: 'stacking-strategy',
        function: 'set-vault-core',
        args: [contractPrincipalCV(DEPLOYER_ADDRESS, 'vault-core')],
        description: 'Set vault-core reference in stacking-strategy',
    },
    {
        contract: 'vault-core',
        function: 'set-stacking-strategy',
        args: [contractPrincipalCV(DEPLOYER_ADDRESS, 'stacking-strategy')],
        description: 'Set stacking-strategy reference in vault-core',
    },
    {
        contract: 'vault-core',
        function: 'enable-stacking',
        args: [],
        description: 'Enable stacking functionality in vault-core',
    },
];

// ========================================
// HELPER FUNCTIONS
// ========================================

async function getNextNonce(address: string): Promise<number> {
    try {
        const response = await fetch(`${NETWORK.coreApiUrl}/extended/v1/address/${address}/nonces`);
        const data = await response.json();
        return data.possible_next_nonce || 0;
    } catch (error) {
        throw new Error('Failed to fetch nonce');
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// CONFIGURATION EXECUTION
// ========================================

async function executeConfiguration() {
    console.log('\n🔧 VaultaYield Mainnet Configuration Starting...\n');
    console.log('Deployer:', DEPLOYER_ADDRESS);

    let currentNonce = await getNextNonce(DEPLOYER_ADDRESS);
    console.log(`Starting nonce: ${currentNonce}\n`);

    const results = [];

    for (const step of CONFIG_STEPS) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`⚙️  ${step.description}`);
        console.log(`Contract: ${step.contract}.${step.function}`);
        console.log(`Nonce: ${currentNonce}`);
        console.log('='.repeat(60));

        try {
            const txOptions: any = {
                contractAddress: DEPLOYER_ADDRESS,
                contractName: step.contract,
                functionName: step.function,
                functionArgs: step.args,
                senderKey: DEPLOYER_KEY,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
                nonce: BigInt(currentNonce),
                fee: BigInt(200000), // 0.2 STX
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });

            if ('error' in broadcastResponse) {
                throw new Error(broadcastResponse.error);
            }

            console.log(`✅ SUCCESS`);
            console.log(`📋 TxID: ${broadcastResponse.txid}`);
            console.log(`🔗 https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);

            results.push({
                step: step.description,
                txId: broadcastResponse.txid,
                nonce: currentNonce,
                status: 'success',
            });

            currentNonce++;

            // Wait 30 seconds between configurations
            console.log('\n⏳ Waiting 30s for confirmation...');
            await sleep(30000);

        } catch (error: any) {
            console.error(`❌ FAILED: ${error.message}`);
            results.push({
                step: step.description,
                status: 'failed',
                error: error.message,
            });
            // Continue with next step even if one fails
        }
    }

    // Save configuration results
    fs.writeFileSync(
        'configuration-mainnet.json',
        JSON.stringify({
            timestamp: new Date().toISOString(),
            deployer: DEPLOYER_ADDRESS,
            results
        }, null, 2)
    );

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CONFIGURATION SUMMARY');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');

    console.log(`✅ Successful: ${successful.length}/${CONFIG_STEPS.length}`);
    console.log(`❌ Failed: ${failed.length}/${CONFIG_STEPS.length}`);

    if (successful.length > 0) {
        console.log('\n✅ Completed Steps:');
        successful.forEach(r => {
            console.log(`  - ${r.step}`);
            console.log(`    TxID: ${r.txId}`);
        });
    }

    if (failed.length > 0) {
        console.log('\n❌ Failed Steps:');
        failed.forEach(r => {
            console.log(`  - ${r.step}`);
            console.log(`    Error: ${r.error}`);
        });
    }

    console.log('\n📝 Configuration record saved to: configuration-mainnet.json');

    if (successful.length === CONFIG_STEPS.length) {
        console.log('\n✅ ALL CONFIGURATION COMPLETE!');
        console.log('\n📌 NEXT STEPS:');
        console.log('1. Verify all configuration transactions confirmed');
        console.log('2. Run verification script to test read-only functions');
        console.log('3. Make first deposit to initialize share price (IMPORTANT!)');
        console.log('4. Update documentation with deployed addresses');
    }
}

// ========================================
// EXECUTE CONFIGURATION
// ========================================

executeConfiguration()
    .then(() => {
        console.log('\n✅ Configuration process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Configuration failed:', error);
        process.exit(1);
    });
