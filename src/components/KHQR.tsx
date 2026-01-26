'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { generateKHQR } from '@/lib/khqr.util';

interface KHQRProps {
    amount: number;
    currency: 'USD' | 'KHR';
    merchantName?: string;
    bakongId?: string;
}

export const KHQR = ({ amount, currency, merchantName = 'MyShop POS', bakongId = 'myshop@bakong' }: KHQRProps) => {
    const khqrString = generateKHQR({
        amount,
        currency,
        merchantName,
        bakongId
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
                Scan this QR with Bakong or any supported mobile banking app
            </p>

            <div className="mt-4 flex items-center justify-center grayscale opacity-50 gap-3">
                <span className="text-[10px] font-bold">ABA</span>
                <span className="text-[10px] font-bold">ACLEDA</span>
                <span className="text-[10px] font-bold">WING</span>
            </div>
        </div>
    );
};
