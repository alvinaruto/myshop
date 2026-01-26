/**
 * Bakong KHQR Generator Utility (EMVCo Standard)
 */

interface KHQRConfig {
    amount: number;
    currency: 'USD' | 'KHR';
    merchantName: string;
    bakongId: string;
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
 * CRC-16 CCITT (XModem) Calculation
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
 * Generates a real KHQR string based on EMVCo specifications
 */
export const generateKHQR = ({
    amount,
    currency,
    merchantName,
    bakongId,
    merchantCity = 'Phnom Penh',
    billNumber = '001'
}: KHQRConfig): string => {
    // 00. Payload Format Indicator
    let khqr = formatTLV('00', '01');

    // 01. Point of Initiation Method (12 = Dynamic QR)
    khqr += formatTLV('01', '12');

    // 29. Bakong Merchant Account Information
    // This is the essential part for Bakong/KHQR interoperability
    const merchantAccountInfo =
        formatTLV('00', bakongId) +
        formatTLV('01', merchantName);

    khqr += formatTLV('29', merchantAccountInfo);

    // 52. Merchant Category Code
    khqr += formatTLV('52', '0000');

    // 53. Transaction Currency (840 = USD, 116 = KHR)
    khqr += formatTLV('53', currency === 'USD' ? '840' : '116');

    // 54. Transaction Amount
    khqr += formatTLV('54', amount.toString());

    // 58. Country Code
    khqr += formatTLV('58', 'KH');

    // 59. Merchant Name
    khqr += formatTLV('59', merchantName);

    // 60. Merchant City
    khqr += formatTLV('60', merchantCity);

    // 62. Additional Data Field (Bill Number)
    const additionalData = formatTLV('01', billNumber);
    khqr += formatTLV('62', additionalData);

    // 63. CRC-16 (Checksum)
    khqr += '6304'; // Tag 63, Length 04
    khqr += calculateCRC16(khqr);

    return khqr;
};
