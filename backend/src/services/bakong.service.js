const axios = require('axios');

const BAKONG_API_URL = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh/v1';
const BAKONG_EMAIL = process.env.BAKONG_EMAIL;
let cachedToken = process.env.BAKONG_TOKEN || null;

const bakongApi = axios.create({
    baseURL: BAKONG_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Renew Bakong API Token
 */
const renewToken = async () => {
    if (!BAKONG_EMAIL) {
        console.warn('BAKONG_EMAIL not set, cannot renew token');
        return null;
    }

    try {
        console.log('Renewing Bakong token for:', BAKONG_EMAIL);
        const response = await axios.post(`${BAKONG_API_URL}/renew_token`, {
            email: BAKONG_EMAIL
        });

        if (response.data && (response.data.responseCode === 0 || response.data.responseCode === '0')) {
            cachedToken = response.data.data.token;
            console.log('Bakong token renewed successfully');
            return cachedToken;
        }
        throw new Error(response.data.responseMessage || 'Failed to renew token');
    } catch (error) {
        console.error('Bakong Token Renewal Error:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Check transaction status by identifier
 * @param {string} type - 'md5', 'externalRef', or 'hash'
 * @param {string} value - The identifier value
 * @returns {Promise<Object>} - The transaction status details
 */
const checkTransaction = async (type, value) => {
    const performRequest = async (token) => {
        const payload = {};
        payload[type === 'externalRef' ? 'externalRef' : type] = value;

        const endpointMap = {
            'md5': '/check_transaction_by_md5',
            'externalRef': '/check_transaction_by_external_ref',
            'hash': '/check_transaction_by_hash'
        };

        const endpoint = endpointMap[type];

        return await bakongApi.post(endpoint, payload, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
    };

    try {
        let response = await performRequest(cachedToken);

        // If unauthorized and we have email, try to renew token and retry once
        if (response.data && response.data.responseCode === 1 && response.data.errorCode === 401 && BAKONG_EMAIL) {
            const newToken = await renewToken();
            if (newToken) {
                response = await performRequest(newToken);
            }
        }

        if (response.data && (response.data.responseCode === 0 || response.data.responseCode === '0')) {
            return {
                success: true,
                data: response.data.data || response.data
            };
        } else {
            return {
                success: false,
                message: response.data.responseMessage || 'Transaction check failed',
                code: response.data.responseCode,
                errorCode: response.data.errorCode
            };
        }

    } catch (error) {
        console.error('Bakong API Error:', error.response?.data || error.message);
        throw new Error('Failed to check transaction status with Bakong');
    }
};

/**
 * Check transaction status by MD5 hash
 */
const checkTransactionStatus = (md5) => checkTransaction('md5', md5);

/**
 * Check transaction status by External Reference
 */
const checkTransactionByRef = (externalRef) => checkTransaction('externalRef', externalRef);

module.exports = {
    checkTransactionStatus,
    checkTransactionByRef,
    renewToken
};
