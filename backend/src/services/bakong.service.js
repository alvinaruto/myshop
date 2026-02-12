const axios = require('axios');

const BAKONG_API_URL = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh/v1';
const BAKONG_TOKEN = process.env.BAKONG_TOKEN; // Optional, some gateways require it

const bakongApi = axios.create({
    baseURL: BAKONG_API_URL,
    headers: {
        'Content-Type': 'application/json',
        ...(BAKONG_TOKEN && { 'Authorization': `Bearer ${BAKONG_TOKEN}` })
    }
});

/**
 * Check transaction status by MD5 hash of the KHQR string
 * @param {string} md5 - The MD5 hash of the KHQR string
 * @returns {Promise<Object>} - The transaction status details
 */
const checkTransactionStatus = async (md5) => {
    try {
        const response = await bakongApi.post('/check_transaction_by_md5', {
            md5
        });

        // Bakong API response structure:
        // {
        //   "responseCode": 0,
        //   "responseMessage": "Success",
        //   "data": { ... }
        // }
        // Or sometimes directly returns data depending on specific gateway implementation.
        // We will assume standard structure but handle variations.

        if (response.data && (response.data.responseCode === 0 || response.data.responseCode === '0')) {
            return {
                success: true,
                data: response.data.data || response.data
            };
        } else {
            return {
                success: false,
                message: response.data.responseMessage || 'Transaction check failed',
                code: response.data.responseCode
            };
        }

    } catch (error) {
        console.error('Bakong API Error:', error.response?.data || error.message);
        throw new Error('Failed to check transaction status with Bakong');
    }
};

module.exports = {
    checkTransactionStatus
};
