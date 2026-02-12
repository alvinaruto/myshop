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
 * Manual EMVCo Tag Builder for KHQR
 */
const buildTag = (tag: string, value: string): string => {
    const len = value.length.toString().padStart(2, '0');
    return `${tag}${len}${value}`;
};

/**
 * CRC16-CCITT implementation for KHQR
 */
const crc16 = (data: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc <<= 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

/**
 * Generates a KHQR string manually following the BSTHEN pattern
 */
export const generateKHQR = ({
    amount,
    currency,
    merchantName,
    accountNumber,
    merchantCity = 'PHNOM PENH',
    billNumber,
}: KHQRConfig): string => {
    let khqr = '';

    // Tag 00: Payload Format Indicator
    khqr += buildTag('00', '01');

    // Tag 01: Point of Initiation Method (11 for Static, 12 for Dynamic)
    const isDynamic = amount > 0;
    khqr += buildTag('01', isDynamic ? '12' : '11');

    // Tag 29: Merchant Account Information (Individual)
    const tag29Value = buildTag('00', accountNumber);
    khqr += buildTag('29', tag29Value);

    // Tag 52: Merchant Category Code
    khqr += buildTag('52', '5999');

    // Tag 53: Transaction Currency (840 for USD, 116 for KHR)
    khqr += buildTag('53', currency === 'USD' ? '840' : '116');

    // Tag 54: Transaction Amount
    if (isDynamic) {
        khqr += buildTag('54', amount.toFixed(2));
    }

    // Tag 58: Country Code
    khqr += buildTag('58', 'KH');

    // Tag 59: Merchant Name
    khqr += buildTag('59', merchantName);

    // Tag 60: Merchant City
    khqr += buildTag('60', merchantCity);

    // Tag 62: Additional Data Field Template
    let tag62Value = '';
    if (billNumber) tag62Value += buildTag('01', billNumber);
    // Add mobile number if available (from config)
    tag62Value += buildTag('02', '078211599');
    tag62Value += buildTag('03', merchantName); // Store Label

    if (tag62Value) {
        khqr += buildTag('62', tag62Value);
    }

    // Final Tag 63: CRC
    khqr += '6304';
    khqr += crc16(khqr);

    return khqr;
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
