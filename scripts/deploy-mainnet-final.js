// VaultaYield Mainnet Deployment - reads from Mainnet.toml
const { makeContractDeploy, broadcastTransaction, AnchorMode, privateKeyToAddress } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const fs = require('fs');
const path = require('path');
const toml = require('toml');
const bip39 = require('bip39');
const { HDKey } = require('@scure/bip32');

async function main() {
    console.log('\n🚀 VaultaYield Mainnet Deployment\n');

    // Read Mainnet.toml
    const configPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const config = toml.parse(configFile);
    const mnemonic = config.accounts.deployer.mnemonic;

    console.log('✅ Loaded Mainnet.toml configuration');

    // Derive private key from mnemonic (BIP39 -> BIP32)
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);
    const derivedKey = masterKey.derive("m/44'/5757'/0'/0/0"); // Stacks derivation path
    const privateKeyHex = Buffer.from(derivedKey.privateKey).toString('hex');
    const DEPLOYER_KEY = privateKeyHex + '01'; // Compressed key marker

    // STACKS_MAINNET is an object, not a constructor in this version
    const NETWORK = require('@stacks/network').STACKS_MAINNET;
    const DEPLOYER_ADDRESS = privateKeyToAddress(DEPLOYER_KEY, NETWORK.version);

    console.log('Deployer Address:', DEPLOYER_ADDRESS);
    console.log('\n⚠️  WARNING: DEPLOYING TO MAINNET WITH REAL STX');
    console.log('\n⏰ Starting in 10 seconds... (Ctrl+C to cancel)\n');

    await new Promise(r => setTimeout(r, 10000));

    // Get nonce
    const nonceRes = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${DEPLOYER_ADDRESS}/nonces`);
    const nonceData = await nonceRes.json();
    let nonce = nonceData.possible_next_nonce || 0;
    console.log(`Starting nonce: ${nonce}\n`);

    const CONTRACTS = ['vault-token', 'fee-collector', 'stacking-strategy', 'harvest-manager', 'compound-engine', 'vault-core'];
    const record = {
        timestamp: new Date().toISOString(),
        network: 'mainnet',
        deployer: DEPLOYER_ADDRESS,
        contracts: []
    };

    // Deploy each contract
    for (const contractName of CONTRACTS) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📦 Deploying: ${contractName} (nonce: ${nonce})`);
        console.log('='.repeat(60));

        try {
            // Read contract
            const contractPath = path.join(__dirname, '..', 'contracts', `${contractName}.clar`);
            const codeBody = fs.readFileSync(contractPath, 'utf-8');
            console.log(`✅ Loaded contract (${codeBody.length} chars)`);

            // Create transaction
            const txOptions = {
                contractName,
                codeBody,
                senderKey: DEPLOYER_KEY,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
                nonce: BigInt(nonce),
                fee: BigInt(500000), // 0.5 STX
                clarityVersion: 2,
            };

            const transaction = await makeContractDeploy(txOptions);
            console.log('✅ Transaction created');

            // Broadcast
            console.log('📡 Broadcasting to mainnet...');
            const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });

            if ('error' in broadcastResponse) {
                throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
            }

            const txId = broadcastResponse.txid;
            console.log(`✅ SUCCESS!`);
            console.log(`📋 TxID: ${txId}`);
            console.log(`🔗 https://explorer.hiro.so/txid/${txId}?chain=mainnet`);

            // Record
            record.contracts.push({
                name: contractName,
                address: `${DEPLOYER_ADDRESS}.${contractName}`,
                txId: txId,
                nonce: nonce,
                status: 'pending'
            });

            nonce++;

            // Save progress
            fs.writeFileSync('deployment-mainnet.json', JSON.stringify(record, null, 2));
            console.log('📝 Progress saved');

            // Wait before next deployment
            if (contractName !== CONTRACTS[CONTRACTS.length - 1]) {
                console.log(`\n⏳ Waiting 60 seconds before next deployment...\n`);
                await new Promise(r => setTimeout(r, 60000));
            }

        } catch (error) {
            console.error(`❌ FAILED: ${error.message}`);
            record.contracts.push({
                name: contractName,
                address: `${DEPLOYER_ADDRESS}.${contractName}`,
                txId: '',
                nonce: nonce,
                status: 'failed'
            });
            fs.writeFileSync('deployment-mainnet.json', JSON.stringify(record, null, 2));
            console.error('\n⛔ Deployment stopped due to error');
            break;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('='.repeat(60));

    const successful = record.contracts.filter(c => c.status !== 'failed');
    const failed = record.contracts.filter(c => c.status === 'failed');

    console.log(`✅ Successful: ${successful.length}/${CONTRACTS.length}`);
    console.log(`❌ Failed: ${failed.length}/${CONTRACTS.length}`);

    if (successful.length > 0) {
        console.log('\n✅ Deployed Contracts:');
        successful.forEach(c => {
            console.log(`  - ${c.name}: ${c.address}`);
            console.log(`    TxID: ${c.txId}`);
        });
    }

    if (failed.length > 0) {
        console.log('\n❌ Failed Deployments:');
        failed.forEach(c => console.log(`  - ${c.name}`));
    }

    console.log('\n📝 Full record: deployment-mainnet.json');
    console.log(`🔗 View deployer: https://explorer.hiro.so/address/${DEPLOYER_ADDRESS}?chain=mainnet`);

    if (successful.length === CONTRACTS.length) {
        console.log('\n✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY!');
        console.log('\n📌 NEXT STEPS:');
        console.log('1. Verify all transactions on explorer');
        console.log('2. Run configuration: npm run configure:mainnet');
        console.log('3. Make first deposit to initialize share price');
    }
}

main()
    .then(() => {
        console.log('\n✅ Deployment process completed');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Deployment failed:', error);
        process.exit(1);
    });
