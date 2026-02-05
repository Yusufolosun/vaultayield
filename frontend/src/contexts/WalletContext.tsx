'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userSession, authenticate, disconnect, getUserAddress } from '@/lib/stacks/wallet';
import { IS_MAINNET } from '@/lib/stacks/contracts';

interface WalletContextType {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    connect: () => void;
    disconnect: () => void;
    network: 'mainnet' | 'testnet';
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const network = IS_MAINNET ? 'mainnet' : 'testnet';

    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            setAddress(getUserAddress(IS_MAINNET));
        }
    }, []);

    const connect = () => {
        setIsConnecting(true);
        console.log('Connecting wallet...');
        authenticate(
            () => {
                setAddress(getUserAddress(IS_MAINNET));
                setIsConnecting(false);
            },
            () => {
                setIsConnecting(false);
            }
        );
    };

    const handleDisconnect = () => {
        disconnect();
        setAddress(null);
    };

    return (
        <WalletContext.Provider
            value={{
                address,
                isConnected: !!address,
                isConnecting,
                connect,
                disconnect: handleDisconnect,
                network,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
}
