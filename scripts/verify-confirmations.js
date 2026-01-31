const fetch = require('node-fetch');

async function checkTxStatus(txId) {
    try {
        const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/tx/${txId}`);
        const data = await response.json();
        return {
            txId,
            status: data.tx_status,
            type: data.tx_type,
            name: data.contract_call?.function_name || data.smart_contract?.contract_id || 'unknown'
        };
    } catch (error) {
        return { txId, status: 'error', message: error.message };
    }
}

const txs = [
    // Deployments
    { name: 'vault-token', txId: 'f3c153862c386b84d0ab22b38d58e54307e0a9d9ee35272c59d07bc2c18ae722' },
    { name: 'fee-collector', txId: '43d102489151c633898d3edc765703a0d7f71fb196c4534f96e3a099f9503b19' },
    { name: 'stacking-strategy', txId: '4d9daea2140c54721b2260fa9b25d2d4353894ae9de79d6f30ace4d181bc7809' },
    { name: 'harvest-manager', txId: '207c7958975cd73242bc3e67d5185f3e3ae866b3ef05637bf443815d213beb2c' },
    { name: 'compound-engine', txId: '799b042df49d1b9d43836be8bb2cfc076e7547c2a834ff24294b806b74cabe8d' },
    { name: 'vault-core-v1', txId: '9cd4746980771e0d08c2faa8c7d63a014435b37e103e987d5daa806d0b709f36' },
    // Configurations
    { name: 'Config: Minter', txId: '8fbea38f875fe0a19b56eaabbb6b98fc65852d4ee24c3eb556f8a2b69557e4e6' },
    { name: 'Config: Fees', txId: '46414eb039f3e2c439c9daad70c5fd92c9462da3be58aa9eac5095bc8615f654' },
    { name: 'Config: Link Strategy', txId: 'bf81f738e9e94e594c939a9a1b9a8f44a2d071cfd305b67358543d4aba7852f0' },
    { name: 'Config: Link Core', txId: 'b6e430dc035ad7c9503b3b614e32fca0fc9ed5d94358ecf1f7c39927d8f6aaa8' },
    { name: 'Config: Enable Stacking', txId: '26ee75812a4b4c68391cd37ac41ce4fdee3e364221b59bc5724f903199752217' }
];

async function main() {
    console.log('🔍 Verifying Mainnet Transactions Status...\n');

    let allConfirmed = true;
    for (const tx of txs) {
        const result = await checkTxStatus(tx.txId);
        const statusIcon = result.status === 'success' ? '✅' : (result.status === 'pending' ? '⏳' : '❌');
        console.log(`${statusIcon} ${tx.name.padEnd(25)} | Status: ${result.status.padEnd(10)} | TxID: ${tx.txId}`);
        if (result.status !== 'success') {
            allConfirmed = false;
        }
    }

    console.log('\n' + '='.repeat(60));
    if (allConfirmed) {
        console.log('🚀 ALL TRANSACTIONS CONFIRMED! The protocol is ready for use.');
    } else {
        console.log('⏳ Some transactions are still pending or failed. Please check carefully.');
    }
    console.log('='.repeat(60));
}

main();
