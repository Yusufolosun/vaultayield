'use client';

import { useState } from 'react';
import { useVaultData, useUserPosition, useStrategyLock } from '@/hooks/useVaultData';
import { withdrawFromVault } from '@/lib/stacks/transactions';
import { useWallet } from '@/contexts/WalletContext';
import { ArrowUp, Loader2, Info, Lock, Unlock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardContent, Button, Input } from '@/components/ui';

export default function WithdrawForm() {
    const [shares, setShares] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isConnected, connect } = useWallet();
    const { data: stats, isLoading: statsLoading } = useVaultData();
    const { data: position, isLoading: positionLoading } = useUserPosition();
    const { data: isUnlocked, isLoading: lockLoading } = useStrategyLock();

    const sharePrice = stats?.sharePrice || 1;
    const grossStx = shares ? Number(shares) * sharePrice : 0;
    const withdrawFee = grossStx * 0.005; // 0.5%
    const netStx = Math.max(0, grossStx - withdrawFee);

    const handleMax = () => {
        if (position?.shares) {
            setShares(position.shares.toString());
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) {
            connect();
            return;
        }

        const numShares = Number(shares);
        if (!shares || numShares <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (position && numShares > position.shares) {
            toast.error('Insufficient share balance');
            return;
        }

        if (isUnlocked === false) {
            toast.error('Vault is currently locked in a stacking cycle');
            return;
        }

        setIsSubmitting(true);
        try {
            await withdrawFromVault(numShares, (data) => {
                toast.success('Withdrawal transaction broadcasted!');
                setShares('');
                setIsSubmitting(false);
            });
        } catch (error: any) {
            toast.error(error.message || 'Transaction failed');
            setIsSubmitting(false);
        }
    };

    return (
        <Card shadow="xl" className="max-w-lg mx-auto">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Withdraw STX</h2>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-900 text-[10px] font-bold uppercase tracking-wider">
                        {lockLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isUnlocked ? (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                                <Unlock className="w-3 h-3" />
                                Unlocked
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-amber-600">
                                <Lock className="w-3 h-3" />
                                Locked
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleWithdraw} className="space-y-6">
                    {/* Input Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-neutral-500">Shares to burn</span>
                            <span className="text-neutral-400">
                                Balance: {positionLoading ? '...' : position?.shares?.toLocaleString() || '0'} vySTX
                            </span>
                        </div>
                        <div className="relative group">
                            <Input
                                type="number"
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                                placeholder="0.00"
                                sizeVariant="lg"
                            />
                            <button
                                type="button"
                                onClick={handleMax}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center -my-3 relative z-10">
                        <div className="bg-white dark:bg-neutral-800 p-2 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm">
                            <ArrowUp className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>

                    {/* Preview Info */}
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 space-y-3 border border-neutral-100 dark:border-neutral-800/50">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Estimated Return</span>
                            <span className="font-bold text-neutral-900 dark:text-white">
                                {statsLoading ? '...' : netStx.toLocaleString(undefined, { maximumFractionDigits: 4 })} STX
                            </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-neutral-400">Withdrawal Fee (0.5%)</span>
                            <span className="text-neutral-400">-{withdrawFee.toFixed(4)} STX</span>
                        </div>
                        <div className="pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                                <Info className="w-3 h-3" />
                                <span>STX will be sent directly to your wallet</span>
                            </div>
                        </div>
                    </div>

                    {!isUnlocked && isConnected && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                                Withdrawals are currently disabled. Funds are locked in the current stacking cycle and will be available for withdrawal at the next harvest.
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || !isUnlocked || (isConnected && (!shares || Number(shares) <= 0))}
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        className="w-full"
                    >
                        {!isConnected ? 'Connect Wallet' : !isUnlocked ? 'Withdraw Locked' : 'Withdraw STX'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
