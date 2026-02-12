/**
 * Bakong KHQR Generator Utility (Using official bakong-khqr package)
 */

import { BakongKHQR, IndividualInfo } from 'bakong-khqr';

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
}: KHQRConfig): string => {
    // Note: for Bakong individual accounts, the ID is typically phone@bank
    // If the user's phone is 078211599 and they use Bakong, it might be 078211599@nbc
    // However, the package's IndividualInfo takes bakongAccountId, merchantName, accountInformation, currency, amount

    // We'll use the accountNumber as the bakongAccountId. 
    // If it's just a phone number, we append @nbc as a sane default for "Bakong" account.
    const bakongAccountId = accountNumber.includes('@') ? accountNumber : `${accountNumber}@nbc`;

    const info = new IndividualInfo(
        bakongAccountId,
        merchantName,
        merchantCity,
        currency === 'USD' ? '840' : '116',
        amount
    );

    const khqr = new BakongKHQR();
    const result = khqr.generateIndividual(info);

    if (result && result.data && result.data.qr) {
        return result.data.qr;
    }

    // Fallback or error handling
    console.error('Failed to generate KHQR:', result);
    return '';
};

import CryptoJS from 'crypto-js';

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
