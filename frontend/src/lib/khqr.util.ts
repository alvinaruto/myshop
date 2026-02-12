/**
 * Bakong KHQR Generator Utility (EMVCo Standard)
 * 
 * Based on real ACLEDA KHQR format:
 * 00020101021130380009khqr@aclb0111855256585060206ACLEDA...
 */

import CryptoJS from 'crypto-js';

interface KHQRConfig {
    amount: number;
    currency: 'USD' | 'KHR';
    merchantName: string;
    accountNumber: string;
    bankCode?: 'ACLEDA' | 'ABA' | 'WING' | 'BAKONG';
    merchantCity?: string;
    billNumber?: string;
}

/**
 * Formats a single EMVCo Tag-Length-Value entry
 */
const formatTLV = (tag: string, value: string): string => {
    const length = value.length.toString().padStart(2, '0');
    return `${tag}${length}${value}`;
};

/**
 * CRC-16 CCITT (XModem) Calculation for KHQR
 */
const calculateCRC16 = (data: string): string => {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

/**
 * Bank-specific KHQR domain/acquirer IDs
 */
const BANK_DOMAINS: Record<string, string> = {
    'ACLEDA': 'khqr@aclb',
    'ABA': 'khqr@aba',
    'WING': 'khqr@wing',
    'BAKONG': 'bakong@nbc'
};

/**
 * Generates a real KHQR string based on EMVCo specifications
 * Compatible with ACLEDA, ABA, WING, and Bakong
 */
export const generateKHQR = ({
    amount,
    currency,
    merchantName,
    accountNumber,
    bankCode = 'ACLEDA',
    merchantCity = 'PHNOM PENH',
    billNumber
}: KHQRConfig): string => {
    // 00. Payload Format Indicator
    let khqr = formatTLV('00', '01');

    // 01. Point of Initiation Method 
    // 11 = Static QR (reusable), 12 = Dynamic QR (one-time with amount)
    khqr += formatTLV('01', amount > 0 ? '12' : '11');

    // 30. Merchant Account Information (ACLEDA style)
    // This is the standard format used by Cambodian banks
    const acquirerId = BANK_DOMAINS[bankCode] || BANK_DOMAINS['ACLEDA'];
    const merchantAccountInfo =
        formatTLV('00', acquirerId) +           // Acquirer ID (e.g., khqr@aclb)
        formatTLV('01', accountNumber) +         // Account number (phone)
        formatTLV('02', bankCode);               // Bank name

    khqr += formatTLV('30', merchantAccountInfo);

    // 52. Merchant Category Code (2000 = General Merchandise)
    khqr += formatTLV('52', '2000');

    // 53. Transaction Currency (840 = USD, 116 = KHR)
    khqr += formatTLV('53', currency === 'USD' ? '840' : '116');

    // 54. Transaction Amount (only for dynamic QR)
    if (amount > 0) {
        khqr += formatTLV('54', amount.toFixed(2));
    }

    // 58. Country Code
    khqr += formatTLV('58', 'KH');

    // 59. Merchant Name (max 25 chars)
    khqr += formatTLV('59', merchantName.substring(0, 25).toUpperCase());

    // 60. Merchant City
    khqr += formatTLV('60', merchantCity.toUpperCase());

    // 62. Additional Data Field (Bill Number/Reference)
    if (billNumber) {
        const additionalData = formatTLV('02', billNumber);
        khqr += formatTLV('62', additionalData);
    }

    // 63. CRC-16 (Checksum) - Must be last
    khqr += '6304'; // Tag 63, Length 04
    khqr += calculateCRC16(khqr);

    return khqr;
};

/**
 * Generates MD5 hash of the KHQR string for Bakong transaction check
 */
export const generateMd5 = (khqrString: string): string => {
    return CryptoJS.MD5(khqrString).toString();
};

/**
 * Default KHQR configuration - Update these with your real account details
 */
export const DEFAULT_KHQR_CONFIG = {
    merchantName: 'MARA LAVIN',
    accountNumber: '85525658506',
    bankCode: 'ACLEDA' as const,
    merchantCity: 'PHNOM PENH'
};
