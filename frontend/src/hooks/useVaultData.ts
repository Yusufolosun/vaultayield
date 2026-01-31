'use client';

import { useQuery } from '@tanstack/react-query';
import { getReadOnlyCall, getVaultStats, getUserPosition } from '@/lib/stacks/queries';
import { useWallet } from '@/contexts/WalletContext';

export function useVaultData() {
    return useQuery({
        queryKey: ['vault-stats'],
        queryFn: getVaultStats,
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}

export function useUserPosition() {
    const { address, isConnected } = useWallet();

    return useQuery({
        queryKey: ['user-position', address],
        queryFn: () => address ? getUserPosition(address) : null,
        enabled: isConnected && !!address,
        refetchInterval: 30000,
    });
}
export function useStxBalance() {
    const { address, isConnected } = useWallet();

    return useQuery({
        queryKey: ['stx-balance', address],
        queryFn: async () => {
            if (!address) return 0;
            const res = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/balances`);
            const data = await res.json();
            return Number(data.stx.balance) / 1_000_000;
        },
        enabled: isConnected && !!address,
        refetchInterval: 30000,
    });
}

export function useStrategyLock() {
    return useQuery({
        queryKey: ['strategy-lock'],
        queryFn: async () => {
            const result = await getReadOnlyCall({
                contractName: 'stacking-strategy',
                functionName: 'is-unlocked',
            });
            // Handle (response-ok true) or direct boolean
            if (result.success && result.value !== undefined) {
                return result.value === true || result.value.value === true;
            }
            return result.value === true || result === true || result.value?.value === true;
        },
        refetchInterval: 60000,
    });
}
