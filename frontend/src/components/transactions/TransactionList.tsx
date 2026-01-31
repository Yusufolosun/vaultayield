'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { IS_MAINNET } from '@/lib/stacks/contracts';

export default function TransactionList() {
    const { data: transactions, isLoading, isError } = useTransactions();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-neutral-500 font-medium">Fetching history...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 text-center">
                <XCircle className="w-10 h-10 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-900 dark:text-red-400">Failed to load history</h3>
                <p className="text-red-700 dark:text-red-300/80 text-sm">Please check your network connection and try again.</p>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-12 rounded-3xl border border-neutral-100 dark:border-neutral-800 text-center">
                <Clock className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-400">No transactions yet</h3>
                <p className="text-neutral-500 text-sm max-w-xs mx-auto">Your vault deposits and withdrawals will appear here once broadcasted.</p>
            </div>
        );
    }

    const getTxType = (tx: any) => {
        const fn = tx.contract_call?.function_name;
        if (fn === 'deposit') return { label: 'Deposit', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
        if (fn === 'withdraw') return { label: 'Withdraw', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
        return { label: 'Contract Call', icon: Clock, color: 'text-neutral-600', bg: 'bg-neutral-100 dark:bg-neutral-800' };
    };

    return (
        <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-700">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Activity</th>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                        {transactions.map((tx: any) => {
                            const type = getTxType(tx);
                            const Icon = type.icon;
                            const date = new Date(tx.burn_block_time * 1000).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <tr key={tx.tx_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${type.bg}`}>
                                                <Icon className={`w-4 h-4 ${type.color}`} />
                                            </div>
                                            <span className="font-bold text-neutral-900 dark:text-white capitalize">
                                                {type.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {tx.tx_status === 'success' ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : tx.tx_status === 'pending' ? (
                                                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`text-sm font-medium capitalize ${tx.tx_status === 'success' ? 'text-emerald-700 dark:text-emerald-400' :
                                                    tx.tx_status === 'pending' ? 'text-amber-700 dark:text-amber-400' :
                                                        'text-red-700 dark:text-red-400'
                                                }`}>
                                                {tx.tx_status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                            {tx.contract_call?.function_args?.[0]?.repr?.replace('u', '')
                                                ? (Number(tx.contract_call.function_args[0].repr.replace('u', '')) / 1_000_000).toLocaleString()
                                                : '-'
                                            }
                                            <span className="ml-1 text-neutral-400 font-medium">
                                                {tx.contract_call?.function_name === 'deposit' ? 'STX' : 'vySTX'}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-500 whitespace-nowrap">
                                        {date}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a
                                            href={`https://explorer.hiro.so/txid/${tx.tx_id}${IS_MAINNET ? '' : '?chain=testnet'}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-blue-600 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
