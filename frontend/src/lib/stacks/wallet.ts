import { AppConfig, UserSession, authenticate as showConnect } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const getAppDetails = () => ({
    name: process.env.NEXT_PUBLIC_APP_NAME || 'VaultaYield',
    icon: typeof window !== 'undefined'
        ? window.location.origin + (process.env.NEXT_PUBLIC_APP_ICON || '/logo.svg')
        : '',
});

export function authenticate(onFinish?: () => void, onCancel?: () => void) {
    console.log('Initiating Stacks authentication...');
    try {
        showConnect({
            appDetails: getAppDetails(),
            redirectTo: '/',
            onFinish: () => {
                console.log('Authentication successful');
                if (onFinish) onFinish();
            },
            onCancel: () => {
                console.log('Authentication cancelled by user');
                if (onCancel) onCancel();
            },
            userSession,
        });
    } catch (error) {
        console.error('Error during showConnect:', error);
        if (onCancel) onCancel();
    }
}

export function disconnect() {
    userSession.signUserOut();
    if (typeof window !== 'undefined') {
        window.location.reload();
    }
}

export function getUserAddress(isMainnet: boolean = true): string | null {
    if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        return isMainnet
            ? userData.profile.stxAddress.mainnet
            : userData.profile.stxAddress.testnet;
    }
    return null;
}

export function getStacksNetwork(isMainnet: boolean = true) {
    return isMainnet ? STACKS_MAINNET : STACKS_TESTNET;
}
