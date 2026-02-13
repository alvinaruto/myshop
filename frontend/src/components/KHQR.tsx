import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateKHQR, DEFAULT_KHQR_CONFIG, generateMd5 } from '@/lib/khqr.util';
import { toast } from 'react-hot-toast';

interface KHQRProps {
    amount: number;
    currency: 'USD' | 'KHR';
    billNumber?: string;
    onPaymentSuccess?: (data: any) => void;
}

export const KHQR = ({ amount, currency, billNumber, onPaymentSuccess }: KHQRProps) => {
    const [status, setStatus] = useState<'pending' | 'success'>('pending');

    const khqrString = generateKHQR({
        amount,
        currency,
        merchantName: DEFAULT_KHQR_CONFIG.merchantName,
        accountNumber: DEFAULT_KHQR_CONFIG.accountNumber,
        bankCode: DEFAULT_KHQR_CONFIG.bankCode,
        merchantCity: DEFAULT_KHQR_CONFIG.merchantCity,
        billNumber: billNumber,
    });

    const handleConfirmPayment = () => {
        setStatus('success');
        toast.success('Payment Confirmed!');
        if (onPaymentSuccess) {
            onPaymentSuccess({
                confirmed: true,
                method: 'manual',
                billNumber,
                amount,
                currency,
                timestamp: new Date().toISOString(),
            });
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* KHQR Card Style */}
            <div className="w-[280px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-stone-100 flex flex-col relative">
                {/* Red Header */}
                <div className="bg-[#E31B23] pt-6 pb-8 px-6 relative">
                    <div className="flex justify-center mb-1">
                        <span className="text-white font-black text-2xl tracking-tighter italic">KHQR</span>
                    </div>
                    {/* Decorative Cutout (Right bottom of red part) */}
                    <div className="absolute right-0 bottom-0 w-8 h-8 bg-white" style={{ clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }}></div>
                </div>

                {/* Merchant Info Section */}
                <div className="px-8 pt-6 pb-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
                        {DEFAULT_KHQR_CONFIG.merchantName}
                    </p>
                    <p className="text-3xl font-black text-stone-900 leading-none">
                        {currency === 'USD' ? '$' : ''}{amount}{currency === 'KHR' ? '៛' : ''}
                    </p>
                </div>

                {/* Dashed Divider */}
                <div className="px-6 my-4">
                    <div className="border-t-2 border-dashed border-stone-200"></div>
                </div>

                {/* QR Code Section */}
                <div className="px-8 pb-10 flex flex-col items-center">
                    <div className="relative p-2 bg-white rounded-xl shadow-sm border border-stone-50">
                        <QRCodeSVG
                            value={khqrString}
                            size={180}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "https://bakong.nbc.gov.kh/images/bakong_logo.png",
                                height: 32,
                                width: 32,
                                excavate: false,
                            }}
                        />

                        {/* Status Overlay */}
                        {status === 'success' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl z-20">
                                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 mb-2">
                                        <span className="text-white text-3xl">✓</span>
                                    </div>
                                    <span className="text-green-600 font-black uppercase text-sm tracking-widest">Paid</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="mt-6 text-[9px] text-center text-stone-400 font-bold uppercase tracking-wider leading-relaxed">
                        Scan to pay with Bakong<br />or any mobile banking app
                    </p>
                </div>

                {/* Floating Bakong Pulse (Waiting state) */}
                {status === 'pending' && (
                    <div className="absolute top-[165px] right-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25"></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full relative z-10"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Payment Button */}
            <div className="mt-6 text-center px-4 w-full">
                {status === 'pending' ? (
                    <>
                        <p className="text-xs text-stone-400 font-medium mb-3">
                            After customer has paid, tap below to confirm
                        </p>
                        <button
                            onClick={handleConfirmPayment}
                            className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all duration-200 text-sm uppercase tracking-wider"
                        >
                            ✓ Confirm Payment Received
                        </button>
                    </>
                ) : (
                    <p className="text-xs text-green-500 font-bold uppercase tracking-wider">
                        Payment confirmed! Processing your order...
                    </p>
                )}
            </div>
        </div>
    );
};
