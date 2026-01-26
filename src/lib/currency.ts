/**
 * Currency utility functions for USD/KHR dual-currency handling
 */

const DEFAULT_EXCHANGE_RATE = 4100;

export const khrToUsd = (khr: number, rate = DEFAULT_EXCHANGE_RATE) => {
    return parseFloat((khr / rate).toFixed(2));
};

export const usdToKhr = (usd: number, rate = DEFAULT_EXCHANGE_RATE) => {
    return Math.round(usd * rate);
};

export interface PaymentParams {
    totalUsd: number;
    paidUsd?: number;
    paidKhr?: number;
    exchangeRate?: number;
}

export interface PaymentResult {
    totalUsd: number;
    paidUsd: number;
    paidKhr: number;
    paidKhrInUsd: number;
    totalPaidUsd: number;
    exchangeRate: number;
    isExact: boolean;
    isPaid: boolean;
    remainingUsd: number;
    remainingKhr: number;
    changeUsd: number;
    changeKhr: number;
}

export const calculatePayment = ({ totalUsd, paidUsd = 0, paidKhr = 0, exchangeRate }: PaymentParams): PaymentResult => {
    const rate = exchangeRate || DEFAULT_EXCHANGE_RATE;

    const paidKhrInUsd = khrToUsd(paidKhr, rate);
    const totalPaidUsd = parseFloat(paidUsd.toString()) + paidKhrInUsd;
    const differenceUsd = totalPaidUsd - parseFloat(totalUsd.toString());

    const result: PaymentResult = {
        totalUsd: parseFloat(totalUsd.toString()),
        paidUsd: parseFloat(paidUsd.toString()),
        paidKhr: parseFloat(paidKhr.toString()),
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
        result.remainingUsd = parseFloat(Math.abs(differenceUsd).toFixed(2));
        result.remainingKhr = usdToKhr(result.remainingUsd, rate);
    } else if (differenceUsd > 0.01) {
        if (differenceUsd < 20) {
            result.changeKhr = usdToKhr(differenceUsd, rate);
            result.changeUsd = 0;
        } else {
            result.changeUsd = Math.floor(differenceUsd);
            const remainderUsd = differenceUsd - result.changeUsd;
            result.changeKhr = usdToKhr(remainderUsd, rate);
        }
    }

    return result;
};

export const formatCurrency = (amount: number, currency = 'USD') => {
    if (currency === 'KHR') {
        return `៛${Math.round(amount).toLocaleString()}`;
    }
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
};
