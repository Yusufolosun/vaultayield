'use client';

import { useUserPosition } from '@/hooks/useVaultData';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, TrendingUp, Info } from 'lucide-react';

export default function UserBalance() {
    const { isConnected, connect } = useWallet();
    const { data: position, isLoading } = useUserPosition();

    if (!isConnected) {
        return (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                <h3 className="text-xl font-bold mb-2">My Position</h3>
                <p className="text-blue-100 mb-6 text-sm opacity-90 max-w-sm">
                    Connect your wallet to view your shares, balance, and historical performance.
                </p>
                <button
                    onClick={connect}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                >
                    Connect Wallet
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    My Position
                </h3>
                <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                    <Info className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                    <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider block mb-1">
                        Shares Owned
                    </span>
                    <div className="flex items-baseline gap-2">
                        {isLoading ? (
                            <div className="h-8 w-24 bg-neutral-100 dark:bg-neutral-700 animate-pulse rounded" />
                        ) : (
                            <>
                                <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {position?.shares?.toLocaleString() || '0'}
                                </span>
                                <span className="text-neutral-500 font-medium">vySTX</span>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <span className="text-sm font-medium text-neutral-500 uppercase tracking-wider block mb-1">
                        Net Value
                    </span>
                    <div className="flex items-baseline gap-2">
                        {isLoading ? (
                            <div className="h-8 w-24 bg-neutral-100 dark:bg-neutral-700 animate-pulse rounded" />
                        ) : (
                            <>
                                <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {position?.stxValue?.toLocaleString() || '0'}
                                </span>
                                <span className="text-neutral-500 font-medium">STX</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <TrendingUp className="w-4 h-4" />
                    <span>+0% Growth</span>
                </div>
                <span className="text-xs text-neutral-500">Calculated in real-time</span>
            </div>
        </div>
    );
}
