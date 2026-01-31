export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';
export const STACKS_API_URL = process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.mainnet.hiro.so';

export const CONTRACT_ADDRESSES = {
    vaultCore: process.env.NEXT_PUBLIC_VAULT_CORE_ADDRESS || '',
    vaultToken: process.env.NEXT_PUBLIC_VAULT_TOKEN_ADDRESS || '',
    feeCollector: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ADDRESS || '',
    stackingStrategy: process.env.NEXT_PUBLIC_STACKING_STRATEGY_ADDRESS || '',
    harvestManager: process.env.NEXT_PUBLIC_HARVEST_MANAGER_ADDRESS || '',
    compoundEngine: process.env.NEXT_PUBLIC_COMPOUND_ENGINE_ADDRESS || '',
};

export const getContractDetails = (contractId: string) => {
    const parts = contractId.split('.');
    if (parts.length !== 2) {
        return { address: '', name: '' };
    }
    return { address: parts[0], name: parts[1] };
};

export const IS_MAINNET = NETWORK === 'mainnet';
