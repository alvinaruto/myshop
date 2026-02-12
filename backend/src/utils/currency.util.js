/**
 * Currency utility functions for USD/KHR dual-currency handling
 */

const DEFAULT_EXCHANGE_RATE = parseFloat(process.env.DEFAULT_EXCHANGE_RATE) || 4100;

/**
 * Convert KHR to USD
 * @param {number} khr - Amount in Riel
 * @param {number} rate - Exchange rate (KHR per 1 USD)
 * @returns {number} Amount in USD
 */
const khrToUsd = (khr, rate = DEFAULT_EXCHANGE_RATE) => {
    return parseFloat((khr / rate).toFixed(2));
};

/**
 * Convert USD to KHR
 * @param {number} usd - Amount in USD
 * @param {number} rate - Exchange rate (KHR per 1 USD)
 * @returns {number} Amount in Riel
 */
const usdToKhr = (usd, rate = DEFAULT_EXCHANGE_RATE) => {
    return Math.round(usd * rate);
};

/**
 * Calculate payment and change for split currency payment
 * @param {Object} params - Payment parameters
 * @param {number} params.totalUsd - Total amount due in USD
 * @param {number} params.paidUsd - Amount paid in USD
 * @param {number} params.paidKhr - Amount paid in KHR
 * @param {number} params.exchangeRate - Current exchange rate
 * @returns {Object} Payment calculation result
 */
const calculatePayment = ({ totalUsd, paidUsd = 0, paidKhr = 0, exchangeRate }) => {
    const rate = exchangeRate || DEFAULT_EXCHANGE_RATE;

    // Convert KHR payment to USD equivalent
    const paidKhrInUsd = khrToUsd(paidKhr, rate);

    // Total paid in USD equivalent
    const totalPaidUsd = parseFloat(paidUsd) + paidKhrInUsd;

    // Calculate difference
    const differenceUsd = totalPaidUsd - parseFloat(totalUsd);

    // Result object
    const result = {
        totalUsd: parseFloat(totalUsd),
        paidUsd: parseFloat(paidUsd),
        paidKhr: parseFloat(paidKhr),
        paidKhrInUsd: paidKhrInUsd,
        totalPaidUsd: parseFloat(totalPaidUsd.toFixed(2)),
        exchangeRate: rate,
        isExact: Math.abs(differenceUsd) < 0.01,
        isPaid: differenceUsd >= -0.01,
        remainingUsd: 0,
        remainingKhr: 0,
        changeUsd: 0,
        changeKhr: 0
    };

    if (differenceUsd < -0.01) {
        // Underpaid - calculate remaining
        result.remainingUsd = parseFloat(Math.abs(differenceUsd).toFixed(2));
        result.remainingKhr = usdToKhr(result.remainingUsd, rate);
    } else if (differenceUsd > 0.01) {
        // Overpaid - calculate change
        // Rule: Give change in KHR for amounts under $20, otherwise in USD
        if (differenceUsd < 20) {
            result.changeKhr = usdToKhr(differenceUsd, rate);
            result.changeUsd = 0;
        } else {
            // For larger change, give whole dollars in USD and remainder in KHR
            result.changeUsd = Math.floor(differenceUsd);
            const remainderUsd = differenceUsd - result.changeUsd;
            result.changeKhr = usdToKhr(remainderUsd, rate);
        }
    }

    return result;
};

/**
 * Format currency for display
 * @param {number} amount - Amount
 * @param {string} currency - 'USD' or 'KHR'
 * @returns {string} Formatted string
 */
const formatCurrency = (amount, currency = 'USD') => {
    if (currency === 'KHR') {
        return `៛${Math.round(amount).toLocaleString()}`;
    }
    return `$${parseFloat(amount).toFixed(2)}`;
};

/**
 * Round KHR to nearest 100 (common practice in Cambodia)
 * @param {number} khr - Amount in Riel
 * @returns {number} Rounded amount
 */
const roundKhr = (khr) => {
    return Math.round(khr / 100) * 100;
};

module.exports = {
    khrToUsd,
    usdToKhr,
    calculatePayment,
    formatCurrency,
    roundKhr,
    DEFAULT_EXCHANGE_RATE
};
