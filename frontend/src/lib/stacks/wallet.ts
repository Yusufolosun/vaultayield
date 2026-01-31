import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const getAppDetails = () => ({
    name: process.env.NEXT_PUBLIC_APP_NAME || 'VaultaYield',
    icon: typeof window !== 'undefined'
        ? window.location.origin + (process.env.NEXT_PUBLIC_APP_ICON || '/logo.svg')
        : '',
});

export function authenticate(onFinish?: () => void) {
    showConnect({
        appDetails: getAppDetails(),
        redirectTo: '/',
        onFinish: () => {
            if (onFinish) onFinish();
        },
        userSession,
    });
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
    return isMainnet ? new StacksMainnet() : new StacksTestnet();
}
