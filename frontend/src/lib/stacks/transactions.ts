import { openContractCall } from '@stacks/connect';
import { uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESSES, IS_MAINNET } from './contracts';
import { getStacksNetwork, getAppDetails } from './wallet';

export async function depositToVault(
    amountStx: number,
    onFinish?: (data: any) => void
) {
    const amountMicroStx = Math.floor(amountStx * 1_000_000);
    const [address, name] = CONTRACT_ADDRESSES.vaultCore.split('.');

    await openContractCall({
        contractAddress: address,
        contractName: name || 'vault-core-v1',
        functionName: 'deposit',
        functionArgs: [uintCV(amountMicroStx)],
        network: getStacksNetwork(IS_MAINNET),
        appDetails: getAppDetails(),
        onFinish: (data) => {
            console.log('Deposit TX:', data.txId);
            if (onFinish) onFinish(data);
        },
        onCancel: () => {
            console.log('User cancelled transaction');
        },
    });
}

export async function withdrawFromVault(
    shares: number,
    onFinish?: (data: any) => void
) {
    const sharesMicroUnits = Math.floor(shares * 1_000_000);
    const [address, name] = CONTRACT_ADDRESSES.vaultCore.split('.');

    await openContractCall({
        contractAddress: address,
        contractName: name || 'vault-core-v1',
        functionName: 'withdraw',
        functionArgs: [uintCV(sharesMicroUnits)],
        network: getStacksNetwork(IS_MAINNET),
        appDetails: getAppDetails(),
        onFinish: (data) => {
            console.log('Withdraw TX:', data.txId);
            if (onFinish) onFinish(data);
        },
        onCancel: () => {
            console.log('User cancelled transaction');
        },
    });
}
