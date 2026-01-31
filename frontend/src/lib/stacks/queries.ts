import { fetchCallReadOnlyFunction as callReadOnlyFunction, cvToJSON, principalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESSES, IS_MAINNET } from './contracts';
import { getStacksNetwork } from './wallet';

export async function getReadOnlyCall({
    contractName,
    functionName,
    functionArgs = [],
    senderAddress = CONTRACT_ADDRESSES.vaultCore,
}: {
    contractName: string;
    functionName: string;
    functionArgs?: any[];
    senderAddress?: string;
}) {
    const [address, name] = CONTRACT_ADDRESSES.vaultCore.split('.');

    const options = {
        contractAddress: address,
        contractName: contractName || name,
        functionName,
        functionArgs,
        network: getStacksNetwork(IS_MAINNET),
        senderAddress,
    };

    const result = await callReadOnlyFunction(options);
    return cvToJSON(result);
}

export async function getVaultStats() {
    const [totalAssets, sharePrice, totalShares] = await Promise.all([
        getReadOnlyCall({ contractName: 'vault-core-v1', functionName: 'get-total-assets' }),
        getReadOnlyCall({ contractName: 'vault-core-v1', functionName: 'get-share-price' }),
        getReadOnlyCall({ contractName: 'vault-core-v1', functionName: 'get-total-shares' }),
    ]);

    return {
        totalAssets: Number(totalAssets.value.value) / 1_000_000,
        sharePrice: Number(sharePrice.value.value) / 1_000_000,
        totalShares: Number(totalShares.value.value) / 1_000_000,
    };
}

export async function getUserPosition(userAddress: string) {
    const [shares, stxValue] = await Promise.all([
        getReadOnlyCall({
            contractName: 'vault-core-v1',
            functionName: 'get-user-shares',
            functionArgs: [principalCV(userAddress)]
        }),
        getReadOnlyCall({
            contractName: 'vault-core-v1',
            functionName: 'get-user-stx-value',
            functionArgs: [principalCV(userAddress)]
        }),
    ]);

    return {
        shares: Number(shares.value.value) / 1_000_000,
        stxValue: Number(stxValue.value.value) / 1_000_000,
    };
}
