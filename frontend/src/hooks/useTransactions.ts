'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACT_ADDRESSES, STACKS_API_URL } from '@/lib/stacks/contracts';

export function useTransactions() {
    const { address, isConnected } = useWallet();

    return useQuery({
        queryKey: ['transactions', address],
        queryFn: async () => {
            if (!address) return [];

            const res = await fetch(`${STACKS_API_URL}/extended/v1/address/${address}/transactions?limit=50`);
            const data = await res.json();

            // Filter for vault-core activities
            const vaultAddress = CONTRACT_ADDRESSES.vaultCore.split('.')[0];
            const vaultName = CONTRACT_ADDRESSES.vaultCore.split('.')[1];

            return data.results.filter((tx: any) => {
                return (
                    tx.tx_type === 'smart_contract' ||
                    (tx.tx_type === 'contract_call' &&
                        tx.contract_call.contract_id === `${vaultAddress}.${vaultName}`)
                );
            });
        },
        enabled: isConnected && !!address,
        refetchInterval: 10000, // Poll more frequently for history
    });
}
