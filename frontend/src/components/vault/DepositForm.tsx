'use client';

import { useState, useEffect } from 'react';
import { useVaultData, useStxBalance } from '@/hooks/useVaultData';
import { depositToVault } from '@/lib/stacks/transactions';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowDown, Info, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';

export default function DepositForm() {
    const [amount, setAmount] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: stats, isLoading: statsLoading } = useVaultData();
    const { data: balance, isLoading: balanceLoading } = useStxBalance();
    const { isConnected, connect } = useWallet();

    const previewShares = (stats && stats.sharePrice > 0 && amount) ? Number(amount) / stats.sharePrice : 0;

    const handleMax = () => {
        if (balance) {
            // Leave 0.05 STX for gas
            const max = Math.max(0, balance - 0.05);
            setAmount(max.toString());
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) {
            connect();
            return;
        }

        const numAmount = Number(amount);
        if (!amount || numAmount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (balance && numAmount > balance) {
            toast.error('Insufficient STX balance');
            return;
        }

        setIsSubmitting(true);
        try {
            await depositToVault(numAmount, (data) => {
                toast.success('Deposit transaction broadcasted!');
                setAmount('');
                setIsSubmitting(false);
            });
        } catch (error: any) {
            toast.error(error.message || 'Transaction failed');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700 shadow-xl shadow-neutral-200/20 max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Deposit STX</h2>
                <div className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                    vySTX VAULT
                </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-6">
                {/* Input Field */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-neutral-500">Amount to deposit</span>
                        <span className="text-neutral-400">
                            Balance: {balanceLoading ? '...' : balance?.toLocaleString() || '0'} STX
                        </span>
                    </div>
                    <div className="relative group">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Button
                                type="button"
                                onClick={handleMax}
                                size="sm"
                                className="px-3 py-1.5 rounded-lg"
                            >
                                MAX
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                    <div className="bg-white dark:bg-neutral-800 p-2 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm">
                        <ArrowDown className="w-4 h-4 text-blue-600" />
                    </div>
                </div>

                {/* Preview Info */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 space-y-3 border border-neutral-100 dark:border-neutral-800/50">
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">You will receive</span>
                        <span className="font-bold text-neutral-900 dark:text-white">
                            {statsLoading ? '...' : previewShares.toLocaleString(undefined, { maximumFractionDigits: 4 })} vySTX
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-500">Exchange Rate</span>
                        <span className="text-neutral-900 dark:text-white font-medium">
                            1 vySTX = {statsLoading ? '...' : stats?.sharePrice?.toFixed(4)} STX
                        </span>
                    </div>
                    <div className="pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                            <Info className="w-3 h-3" />
                            <span>Performance fee: 15% on profits only</span>
                        </div>
                    </div>
                </div>

                {!isConnected && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                            Please connect your Stacks wallet to authorize the deposit transaction.
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isConnected && (!amount || Number(amount) <= 0)}
                    size="lg"
                    className="w-full"
                >
                    {isConnected ? 'Deposit STX' : 'Connect Wallet to Deposit'}
                </Button>
            </form>
        </div>
    );
}
            </form >
        </div >
    );
}
