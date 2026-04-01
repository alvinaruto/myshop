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

// Removed redundant manual builders.
export const generateKHQR = ({
    amount,
    currency,
    merchantName,
    accountNumber,
    merchantCity = 'PHNOM PENH',
    billNumber,
}: KHQRConfig): string => {
    try {
        const isDynamic = amount > 0;
        
        const optionalData: any = {
            currency: currency === 'USD' ? khqrData.currency.usd : khqrData.currency.khr,
            // 855 is required as country code for mobileNumber validation in Bakong Spec
            mobileNumber: '85578211599',
            storeLabel: merchantName,
            terminalLabel: 'POS',
            purposeOfTransaction: 'Cafe Order Payment',
            languageDataName: merchantName,
            merchantCity: merchantCity
        };

        // Only add dynamic fields if amount > 0
        if (isDynamic) {
            optionalData.amount = amount;
            optionalData.billNumber = billNumber;
            optionalData.expirationTimestamp = Date.now() + 15 * 60 * 1000; // 15 mins expiry
        } else if (billNumber) {
            optionalData.billNumber = billNumber;
        }

        const individualInfo = new IndividualInfo(
            accountNumber,
            merchantName,
            merchantCity,
            optionalData
        );

        const khqr = new BakongKHQR();
        const response = khqr.generateIndividual(individualInfo);

        if (response && response.data && response.data.qr) {
            return response.data.qr;
        }
        
        throw new Error(response?.status?.message || 'Unknown generation error');
    } catch (error) {
        console.error('Failed to generate official Bakong KHQR payload:', error);
        return '';
    }
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
