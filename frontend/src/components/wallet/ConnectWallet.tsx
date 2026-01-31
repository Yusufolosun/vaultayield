'use client';

import { useWallet } from '@/contexts/WalletContext';
import { Loader2, Wallet } from 'lucide-react';

export default function ConnectWallet() {
    const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    if (isConnecting) {
        return (
            <button
                disabled
                className="flex items-center gap-2 bg-blue-600/10 text-blue-600 px-4 py-2 rounded-lg font-medium transition-all"
            >
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
            </button>
        );
    }

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={disconnect}
                    className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all group"
                >
                    <Wallet className="w-4 h-4 group-hover:text-blue-600" />
                    {truncateAddress(address)}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
        >
            Connect Wallet
        </button>
    );
}
