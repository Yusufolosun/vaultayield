/**
 * VaultaYield Mainnet Deployment Script
 * Reads configuration from settings/Mainnet.toml
 * 
 * ⚠️ DEPLOYING TO MAINNET WITH REAL STX
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

    // Generate deployer key from mnemonic using BIP39/BIP32
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);
    const derivedKey = masterKey.derive("m/44'/5757'/0'/0/0");

    if (!derivedKey.privateKey) {
        throw new Error('Failed to derive private key');
    }

    const DEPLOYER_KEY = Buffer.from(derivedKey.privateKey).toString('hex') + '01'; // Compressed
    const DEPLOYER_ADDRESS = getAddressFromPrivateKey(DEPLOYER_KEY, NETWORK);

    console.log('\n🚀 VaultaYield Mainnet Deployment\n');
    console.log('⚠️  WARNING: DEPLOYING TO MAINNET WITH REAL STX');
    console.log('Deployer Address:', DEPLOYER_ADDRESS);
    console.log('Network: https://api.mainnet.hiro.so');

    const CONTRACTS = ['vault-token', 'fee-collector', 'stacking-strategy', 'harvest-manager', 'compound-engine', 'vault-core'];
    const DELAY = 60000;

    interface DeploymentRecord {
        timestamp: string;
        network: string;
        deployer: string;
        contracts: Array<{ name: string; address: string; txId: string; nonce: number; status: string }>;
    }

    let record: DeploymentRecord = {
        timestamp: new Date().toISOString(),
        network: 'mainnet',
        deployer: DEPLOYER_ADDRESS,
        contracts: [],
    };

    async function getNonce(address: string): Promise<number> {
        const url = `https://api.mainnet.hiro.so/extended/v1/address/${address}/nonces`;
        const res = await fetch(url);
        const data: any = await res.json();
        return data.possible_next_nonce || 0;
    }

    function readContract(name: string): string {
        return fs.readFileSync(path.join(__dirname, '..', 'contracts', `${name}.clar`), 'utf-8');
    }

    async function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    console.log('\n⏰ Starting in 10 seconds... (Ctrl+C to cancel)\n');
    await sleep(10000);

    let currentNonce = await getNonce(DEPLOYER_ADDRESS);
    console.log(`Starting nonce: ${currentNonce}\n`);

    for (const contractName of CONTRACTS) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📦 Deploying: ${contractName} (nonce: ${currentNonce})`);
        console.log('='.repeat(60));

        try {
            const codeBody = readContract(contractName);
            console.log(`✅ Loaded (${codeBody.length} chars)`);

            const txOptions: any = {
                contractName,
                codeBody,
                senderKey: DEPLOYER_KEY,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
                nonce: BigInt(currentNonce),
                fee: BigInt(500000), // 0.5 STX
                clarityVersion: 2,
            };

            const tx = await makeContractDeploy(txOptions);

            console.log('📡 Broadcasting...');
            const response = await broadcastTransaction({ transaction: tx, network: NETWORK });

            if ('error' in response) {
                throw new Error(response.error as string);
            }

            console.log(`✅ SUCCESS - TxID: ${response.txid}`);
            console.log(`🔗 https://explorer.hiro.so/txid/${response.txid}?chain=mainnet`);

            record.contracts.push({
                name: contractName,
                address: `${DEPLOYER_ADDRESS}.${contractName}`,
                txId: response.txid!,
                nonce: currentNonce,
                status: 'pending',
            });

            currentNonce++;
            fs.writeFileSync('deployment-mainnet.json', JSON.stringify(record, null, 2));

            if (contractName !== CONTRACTS[CONTRACTS.length - 1]) {
                console.log(`\n⏳ Waiting 60s...\n`);
                await sleep(DELAY);
            }

        } catch (error: any) {
            console.error(`❌ FAILED: ${error.message}`);
            record.contracts.push({
                name: contractName,
                address: `${DEPLOYER_ADDRESS}.${contractName}`,
                txId: '',
                nonce: currentNonce,
                status: 'failed',
            });
            console.error(`\n❌ CRITICAL: ${contractName} failed - stopping`);
            break;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));

    const success = record.contracts.filter(c => c.status !== 'failed');
    console.log(`✅ Successful: ${success.length}/${CONTRACTS.length}`);

    if (success.length > 0) {
        console.log('\n✅ Deployed:');
        success.forEach(c => console.log(`  - ${c.name}: ${c.address}\n    ${c.txId}`));
    }

    console.log('\n📝 Saved to: deployment-mainnet.json');
    console.log(`🔗 https://explorer.hiro.so/address/${DEPLOYER_ADDRESS}?chain=mainnet`);

    if (success.length === CONTRACTS.length) {
        console.log('\n✅ ALL CONTRACTS DEPLOYED!');
        console.log('\n📌 NEXT: npm run configure:mainnet');
    }
}

main().catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
});
