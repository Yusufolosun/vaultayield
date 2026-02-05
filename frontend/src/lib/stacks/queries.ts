import { fetchCallReadOnlyFunction as callReadOnlyFunction, cvToJSON, principalCV, uintCV } from '@stacks/transactions';
import { CONTRACT_ADDRESSES, IS_MAINNET, getContractDetails } from './contracts';
import { getStacksNetwork } from './wallet';

// Helper to safely parse numbers from various cvToJSON result formats
function parseNumericResponse(result: any): number {
    try {
        // Handle (response-ok (uint ...))
        if (result.success && result.value) {
            if (result.value.type === 'uint' || typeof result.value.value === 'string' || typeof result.value.value === 'number') {
                return Number(result.value.value);
            }
        }
        // Handle direct (uint ...)
        if (result.type === 'uint' || typeof result.value === 'string' || typeof result.value === 'number') {
            return Number(result.value || result);
        }
        // Fallback for deeply nested value.value
        if (result.value?.value !== undefined) {
            return Number(result.value.value);
        }
        return Number(result);
    } catch (e) {
        console.error('Failed to parse numeric response:', result, e);
        return 0;
    }
}

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
    const { address, name } = getContractDetails(CONTRACT_ADDRESSES.vaultCore);

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
    const { name: vaultName } = getContractDetails(CONTRACT_ADDRESSES.vaultCore);

    const [totalAssetsRes, sharePriceRes, totalSharesRes] = await Promise.all([
        getReadOnlyCall({ contractName: vaultName, functionName: 'get-total-assets' }),
        getReadOnlyCall({ contractName: vaultName, functionName: 'get-share-price' }),
        getReadOnlyCall({ contractName: vaultName, functionName: 'get-total-shares' }),
    ]);

    return {
        totalAssets: parseNumericResponse(totalAssetsRes) / 1_000_000,
        sharePrice: parseNumericResponse(sharePriceRes) / 1_000_000,
        totalShares: parseNumericResponse(totalSharesRes) / 1_000_000,
    };
}

export async function getUserPosition(userAddress: string) {
    const { name: vaultName } = getContractDetails(CONTRACT_ADDRESSES.vaultCore);

    const [sharesRes, stxValueRes] = await Promise.all([
        getReadOnlyCall({
            contractName: vaultName,
            functionName: 'get-user-shares',
            functionArgs: [principalCV(userAddress)]
        }),
        getReadOnlyCall({
            contractName: vaultName,
            functionName: 'get-user-stx-value',
            functionArgs: [principalCV(userAddress)]
        }),
    ]);

    return {
        shares: parseNumericResponse(sharesRes) / 1_000_000,
        stxValue: parseNumericResponse(stxValueRes) / 1_000_000,
    };
}
