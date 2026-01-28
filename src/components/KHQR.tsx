'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateKHQR, DEFAULT_KHQR_CONFIG } from '@/lib/khqr.util';

interface KHQRProps {
    amount: number;
    currency: 'USD' | 'KHR';
    billNumber?: string;
}

export const KHQR = ({ amount, currency, billNumber }: KHQRProps) => {
    const khqrString = generateKHQR({
        amount,
        currency,
        merchantName: DEFAULT_KHQR_CONFIG.merchantName,
        accountNumber: DEFAULT_KHQR_CONFIG.accountNumber,
        bankCode: DEFAULT_KHQR_CONFIG.bankCode,
        merchantCity: DEFAULT_KHQR_CONFIG.merchantCity,
        billNumber: billNumber || `INV${Date.now().toString().slice(-8)}`
    });

    return (
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-inner border-2 border-primary-100">
            <div className="mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        🇰🇭
                    </div>
                    <span className="text-sm font-bold text-gray-800">KHQR Payment</span>
                </div>
                <p className="text-2xl font-black text-primary-600">
                    {currency === 'USD' ? '$' : '៛'}{amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {DEFAULT_KHQR_CONFIG.merchantName}
                </p>
            </div>

            <div className="relative p-4 bg-white border-8 border-primary-50 rounded-xl">
                <QRCodeSVG
                    value={khqrString}
                    size={200}
                    level="H"
                    includeMargin={false}
                />
            </div>

            <p className="mt-4 text-xs text-center text-gray-500 max-w-[180px]">
                Scan with Bakong, ACLEDA, ABA, or any KHQR-supported banking app
            </p>

            <div className="mt-4 flex items-center justify-center gap-3 text-[10px] font-bold text-gray-400">
                <span>ACLEDA</span>
                <span>ABA</span>
                <span>WING</span>
                <span>Bakong</span>
            </div>
        </div>
    );
};
