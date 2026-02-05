'use client';

import { useWallet } from '@/contexts/WalletContext';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ConnectWallet() {
    const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    if (isConnecting) {
        return (
            <Button
                isLoading
                variant="outline"
                size="sm"
                className="text-blue-600 bg-blue-600/10 border-transparent"
            >
                Connecting...
            </Button>
        );
    }

    if (isConnected && address) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnect}
                    leftIcon={<Wallet className="w-4 h-4" />}
                >
                    {truncateAddress(address)}
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={connect}
            size="sm"
        >
            Connect Wallet
        </Button>
    );
}
