import { BakongKHQR, IndividualInfo, khqrData } from 'bakong-khqr';
import CryptoJS from 'crypto-js';

interface KHQRConfig {
    amount: number;
    currency: 'USD' | 'KHR';
    merchantName: string;
    accountNumber: string; // This will be used as the bakongAccountId
    bankCode?: 'BAKONG' | 'WING' | 'ABA' | 'ACLEDA';
    merchantCity?: string;
    billNumber?: string;
}

/**
 * Generates a real KHQR string based on official bakong-khqr package
 */
export const generateKHQR = ({
    amount,
    currency,
    merchantName,
    accountNumber,
    merchantCity = 'PHNOM PENH',
    billNumber,
}: KHQRConfig): string => {
    // SDK expects: bakongAccountID, merchantName, merchantCity, optional = {}

    const info = new IndividualInfo(
        accountNumber,
        merchantName,
        merchantCity,
        {
            currency: currency === 'USD' ? khqrData.currency.usd : khqrData.currency.khr,
            amount: amount,
            billNumber: billNumber,
            // Dynamic QR with amount > 0 REQUIRES expirationTimestamp in the official SDK
            expirationTimestamp: Date.now() + (30 * 60 * 1000), // 30 mins
        }
    );

    const khqr = new BakongKHQR();
    const result = khqr.generateIndividual(info);

    if (result && result.data && result.data.qr) {
        // Double check validity with internal verify
        const verification = BakongKHQR.verify(result.data.qr);
        if (verification.isValid) {
            return result.data.qr;
        }
        console.error('Generated KHQR failed internal verification:', result.data.qr);
    }

    // Fallback or error handling
    console.error('Failed to generate KHQR:', result);
    return '';
};

/**
 * Formats price to USD or KHR format
 * Robustly handles strings or null values
 */
export const formatPrice = (amount: number | string | null | undefined, currency: 'USD' | 'KHR' = 'USD'): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const safeNum = num && !isNaN(num) ? num : 0;

    if (currency === 'USD') {
        return `$${safeNum.toFixed(2)}`;
    }
    return `${safeNum.toLocaleString()} ៛`;
};

/**
 * Generates MD5 hash of the KHQR string for Bakong transaction check
 */
export const generateMd5 = (khqrString: string): string => {
    return CryptoJS.MD5(khqrString).toString();
};

/**
 * Default KHQR configuration
 */
export const DEFAULT_KHQR_CONFIG = {
    merchantName: 'MY SHOP',
    accountNumber: 'lavin_mara@bkrt', // User's Bakong ID
    bankCode: 'BAKONG' as const,
    merchantCity: 'PHNOM PENH'
};
