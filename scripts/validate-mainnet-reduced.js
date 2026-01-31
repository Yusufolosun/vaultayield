/**
 * VaultaYield Mainnet Validation Suite (Reduced)
 * 5 Transactions to verify core functionality within 0.55 STX budget
 */

const {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    uintCV,
    contractPrincipalCV,
    getAddressFromPrivateKey
} = require('@stacks/transactions');
const { STACKS_MAINNET } = require('@stacks/network');
const fs = require('fs');
const path = require('path');
const toml = require('toml');
const bip39 = require('bip39');
const { HDKey } = require('@scure/bip32');

const NETWORK = STACKS_MAINNET;
const API_URL = 'https://api.mainnet.hiro.so';

async function main() {
    console.log('\n🧪 VaultaYield Mainnet Validation (Reduced Suite)\n');

    // 1. Key Setup
    const configPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
    const config = toml.parse(fs.readFileSync(configPath, 'utf-8'));
    const mnemonic = config.accounts.deployer.mnemonic;
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const masterKey = HDKey.fromMasterSeed(seed);
    const derivedKey = masterKey.derive("m/44'/5757'/0'/0/0");
    const DEPLOYER_KEY = Buffer.from(derivedKey.privateKey).toString('hex') + '01';
    const DEPLOYER_ADDRESS = getAddressFromPrivateKey(DEPLOYER_KEY, NETWORK);

    console.log('Deployer:', DEPLOYER_ADDRESS);

    // 2. Fetch Nonce
    const nonceRes = await fetch(`${API_URL}/extended/v1/address/${DEPLOYER_ADDRESS}/nonces`);
    const nonceData = await nonceRes.json();
    let nonce = nonceData.possible_next_nonce || 0;
    console.log(`Starting nonce: ${nonce}\n`);

    const CORE = 'vault-core-v1';
    const FEE = BigInt(100000); // 0.1 STX optimized fee

    const STEPS = [
        {
            name: 'Initial Small Deposit',
            contract: CORE,
            function: 'deposit',
            args: [uintCV(10000)], // 0.01 STX
        },
        {
            name: 'Emergency Pause',
            contract: CORE,
            function: 'pause-contract',
            args: [],
        },
        {
            name: 'Emergency Unpause',
            contract: CORE,
            function: 'unpause-contract',
            args: [],
        },
        {
            name: 'Small Withdrawal',
            contract: CORE,
            function: 'withdraw',
            args: [uintCV(5000)], // Withdraw half shares
        },
        {
            name: 'Re-auth Fee Collector',
            contract: 'fee-collector',
            function: 'set-vault-core',
            args: [contractPrincipalCV(DEPLOYER_ADDRESS, CORE)],
        }
    ];

    for (const step of STEPS) {
        console.log(`\n⚙️  Executing: ${step.name}...`);

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
                fee: FEE,
            };

            const transaction = await makeContractCall(txOptions);
            const response = await broadcastTransaction({ transaction, network: NETWORK });

            if (response.error) throw new Error(response.error);

            console.log(`✅ Success! TxID: ${response.txid}`);
            nonce++;

            if (step !== STEPS[STEPS.length - 1]) {
                console.log('⏳ Waiting 30s for mempool spacing...');
                await new Promise(r => setTimeout(r, 30000));
            }
        } catch (error) {
            console.error(`❌ Failed: ${error.message}`);
            break;
        }
    }

    console.log('\n🏁 Validation suite finished');
}

main().catch(console.error);
