'use client';

import { useVaultData } from '@/hooks/useVaultData';
import { TrendingUp, PieChart, DollarSign, Users } from 'lucide-react';

export default function VaultStats() {
    const { data: stats, isLoading, isError } = useVaultData();

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</span>
            </div>
            <div className="flex flex-col">
                {isLoading ? (
                    <div className="h-8 w-24 bg-neutral-100 dark:bg-neutral-700 animate-pulse rounded" />
                ) : (
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {value}
                    </span>
                )}
            </div>
        </div>
    );

    if (isError) return <div className="text-red-500">Error loading vault statistics</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
                title="Total Value Locked"
                value={`${stats?.totalAssets?.toLocaleString() || '0'} STX`}
                icon={DollarSign}
                color="bg-blue-600"
            />
            <StatCard
                title="Current APY"
                value="12.5%"
                icon={TrendingUp}
                color="bg-emerald-600"
            />
            <StatCard
                title="Share Price"
                value={`${stats?.sharePrice?.toFixed(4) || '1.0000'} STX`}
                icon={PieChart}
                color="bg-purple-600"
            />
            <StatCard
                title="Total vySTX"
                value={`${stats?.totalShares?.toLocaleString() || '0'}`}
                icon={Users}
                color="bg-orange-600"
            />
        </div>
    );
}
