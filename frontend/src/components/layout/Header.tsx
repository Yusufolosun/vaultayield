'use client';

import Link from 'next/link';
import ConnectWallet from '../wallet/ConnectWallet';
import { useWallet } from '@/contexts/WalletContext';

export default function Header() {
    const { isConnected } = useWallet();

    return (
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            V
                        </div>
                        <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            VaultaYield
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Dashboard
                        </Link>
                        <Link href="/history" className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400">
                            History
                        </Link>
                        <Link href="/docs" className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Docs
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <ConnectWallet />
                </div>
            </div>
        </header>
    );
}
