// Final Mainnet Configuration - links everything to vault-core-v1
const { makeContractCall, broadcastTransaction, AnchorMode, contractPrincipalCV } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const fs = require('fs');
const path = require('path');
const toml = require('toml');
const bip39 = require('bip39');
const { HDKey } = require('@scure/bip32');

async function main() {
    console.log('\n🔧 VaultaYield Mainnet Configuration (v1)\n');

    const configPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
    const config = toml.parse(fs.readFileSync(configPath, 'utf-8'));
    const mnemonic = config.accounts.deployer.mnemonic;
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);
    const derivedKey = masterKey.derive("m/44'/5757'/0'/0/0");
    const DEPLOYER_KEY = Buffer.from(derivedKey.privateKey).toString('hex') + '01';

    const NETWORK = require('@stacks/network').STACKS_MAINNET;
    const DEPLOYER_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";

    console.log('Deployer:', DEPLOYER_ADDRESS);

    const nonceRes = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${DEPLOYER_ADDRESS}/nonces`);
    const nonceData = await nonceRes.json();
    let nonce = nonceData.possible_next_nonce || 44;
    console.log(`Starting nonce: ${nonce}\n`);

    const CORE_NAME = 'vault-core-v1';

    const STEPS = [
        {
            contract: 'vault-token',
            function: 'set-vault-core',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, CORE_NAME)],
            desc: 'Auth vault-core-v1 as minter'
        },
        {
            contract: 'fee-collector',
            function: 'set-vault-core',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, CORE_NAME)],
            desc: 'Auth vault-core-v1 for fees'
        },
        {
            contract: 'stacking-strategy',
            function: 'set-vault-core',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, CORE_NAME)],
            desc: 'Link strategy to core-v1'
        },
        {
            contract: 'vault-core-v1', // THE NEW CONTRACT
            function: 'set-stacking-strategy',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, 'stacking-strategy')],
            desc: 'Link core-v1 to strategy'
        },
        {
            contract: 'vault-core-v1',
            function: 'enable-stacking',
            args: [],
            desc: 'Enable protocol stacking'
        }
    ];

    const results = [];

    for (const step of STEPS) {
        console.log(`\n⚙️  ${step.desc}...`);

        try {
            const txOptions = {
                contractAddress: DEPLOYER_ADDRESS,
                contractName: step.contract,
                functionName: step.function,
                functionArgs: step.args,
                senderKey: DEPLOYER_KEY,
                network: NETWORK,
                anchorMode: AnchorMode.Any,
                nonce: BigInt(nonce),
                fee: BigInt(300000), // 0.3 STX for config
            };

            const transaction = await makeContractCall(txOptions);
            const response = await broadcastTransaction({ transaction, network: NETWORK });

            if ('error' in response) throw new Error(response.error);

            console.log(`✅ Success! TxID: ${response.txid}`);
            results.push({ step: step.desc, txId: response.txid, status: 'pending' });

            nonce++;
            fs.writeFileSync('configuration-mainnet-v1.json', JSON.stringify(results, null, 2));

            if (step !== STEPS[STEPS.length - 1]) {
                console.log('⏳ Waiting 45s for propagation...');
                await new Promise(r => setTimeout(r, 45000));
            }
        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);
            results.push({ step: step.desc, error: error.message, status: 'failed' });
            break;
        }
    }

    console.log('\n✅ Configuration sequence v1 finished');
}

main().catch(console.error);
