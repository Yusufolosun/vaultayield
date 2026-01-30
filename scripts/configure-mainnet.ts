/**
 * VaultaYield Mainnet Configuration Script
 * Links deployed contracts together
 * 
 * Run AFTER all contracts deployed successfully
 */

import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    contractPrincipalCV,
    getAddressFromPrivateKey,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import * as fs from 'fs';
import * as path from 'path';
import * as toml from 'toml';
import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';

const NETWORK = STACKS_MAINNET;

async function main() {
    // Read Mainnet.toml
    const tomlPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
    if (!fs.existsSync(tomlPath)) {
        console.error('❌ settings/Mainnet.toml not found');
        process.exit(1);
    }

    const config = toml.parse(fs.readFileSync(tomlPath, 'utf-8'));
    const mnemonic = config.accounts.deployer.mnemonic;

    // Generate deployer key from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);
    const derivedKey = masterKey.derive("m/44'/5757'/0'/0/0");

    if (!derivedKey.privateKey) {
        throw new Error('Failed to derive private key');
    }

    const DEPLOYER_KEY = Buffer.from(derivedKey.privateKey).toString('hex') + '01';
    const DEPLOYER_ADDRESS = getAddressFromPrivateKey(DEPLOYER_KEY, NETWORK);

    console.log('\n🔧 VaultaYield Mainnet Configuration\n');
    console.log('Deployer:', DEPLOYER_ADDRESS);

    // Load deployment record
    if (!fs.existsSync('deployment-mainnet.json')) {
        console.error('❌ ERROR: deployment-mainnet.json not found');
        console.error('Please run deploy:mainnet first');
        process.exit(1);
    }

    const deploymentRecord = JSON.parse(
        fs.readFileSync('deployment-mainnet.json', 'utf-8')
    );

    // Filter out failed contracts and find vault-core (could be vault-core-v1)
    const contractsMap: Record<string, string> = {};
    deploymentRecord.contracts.forEach((c: any) => {
        if (c.status !== 'failed') {
            contractsMap[c.name] = c.address;
        }
    });

    const CORE_CONTRACT = contractsMap['vault-core'] || contractsMap['vault-core-v1'];
    if (!CORE_CONTRACT) {
        throw new Error('Vault core contract not found in deployment record');
    }

    const CORE_NAME = CORE_CONTRACT.split('.')[1];

    // ========================================
    // CONFIGURATION STEPS
    // ========================================

    const CONFIG_STEPS = [
        {
            contract: 'vault-token',
            function: 'set-vault-core',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, CORE_NAME)],
            description: `Set ${CORE_NAME} as authorized minter for vault-token`,
        },
        {
            contract: 'fee-collector',
            function: 'set-vault-core',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, CORE_NAME)],
            description: `Set ${CORE_NAME} as authorized caller for fee-collector`,
        },
        {
            contract: 'stacking-strategy',
            function: 'set-vault-core',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, CORE_NAME)],
            description: `Set ${CORE_NAME} reference in stacking-strategy`,
        },
        {
            contract: CORE_NAME,
            function: 'set-stacking-strategy',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, 'stacking-strategy')],
            description: `Set stacking-strategy reference in ${CORE_NAME}`,
        },
        {
            contract: CORE_NAME,
            function: 'enable-stacking',
            args: [],
            description: `Enable stacking functionality in ${CORE_NAME}`,
        },
    ];

    async function getNextNonce(address: string): Promise<number> {
        const url = `https://api.mainnet.hiro.so/extended/v1/address/${address}/nonces`;
        const res = await fetch(url);
        const data: any = await res.json();
        return data.possible_next_nonce || 0;
    }

    async function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
                fee: BigInt(250000), // 0.25 STX
            };

            const transaction = await makeContractCall(txOptions);
            const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });

            if ('error' in broadcastResponse) {
                throw new Error(broadcastResponse.error as string);
            }

            console.log(`✅ SUCCESS - TxID: ${broadcastResponse.txid}`);
            console.log(`🔗 https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=mainnet`);

            results.push({
                step: step.description,
                txId: broadcastResponse.txid,
                nonce: currentNonce,
                status: 'success',
            });

            currentNonce++;

            if (step !== CONFIG_STEPS[CONFIG_STEPS.length - 1]) {
                console.log('\n⏳ Waiting 45s for confirmation...');
                await sleep(45000);
            }

        } catch (error: any) {
            console.error(`❌ FAILED: ${error.message}`);
            results.push({
                step: step.description,
                status: 'failed',
                error: error.message,
            });
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

    console.log('\n✅ Configuration process finished');
}

main().catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
});
