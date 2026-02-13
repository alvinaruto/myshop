import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateKHQR, DEFAULT_KHQR_CONFIG, generateMd5 } from '@/lib/khqr.util';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface KHQRProps {
    amount: number;
    currency: 'USD' | 'KHR';
    billNumber?: string;
    onPaymentSuccess?: (data: any) => void;
}

const BAKONG_PROXY_URL = 'https://bk-verify.alvinmara7.workers.dev/';

export const KHQR = ({ amount, currency, billNumber, onPaymentSuccess }: KHQRProps) => {
    const [status, setStatus] = useState<'pending' | 'success'>('pending');
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    const khqrString = generateKHQR({
        amount,
        currency,
        merchantName: DEFAULT_KHQR_CONFIG.merchantName,
        accountNumber: DEFAULT_KHQR_CONFIG.accountNumber,
        bankCode: DEFAULT_KHQR_CONFIG.bankCode,
        merchantCity: DEFAULT_KHQR_CONFIG.merchantCity,
        billNumber: billNumber,
    });

    const md5 = generateMd5(khqrString);

    // Polling effect
    useEffect(() => {
        if (status === 'success') return;

        const checkPayment = async () => {
            try {
                const response = await axios.post(BAKONG_PROXY_URL, {
                    md5: md5,
                    externalRef: billNumber
                });

                if (response.data.success) {
                    setStatus('success');
                    toast.success('Payment Verified Automatically!');
                    if (onPaymentSuccess) {
                        onPaymentSuccess(response.data.data);
                    }
                } else {
                    pollTimerRef.current = setTimeout(checkPayment, 3000);
                }
            } catch (error) {
                // Silently retry, as polling is expected to fail until paid
                // We don't want to spam toast errors for polling
                pollTimerRef.current = setTimeout(checkPayment, 5000);
            }
        };

        pollTimerRef.current = setTimeout(checkPayment, 3000);
        return () => {
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        };
    }, [md5, billNumber, status, onPaymentSuccess]);

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

            {/* Verification Status */}
            <div className="mt-8 text-center px-4 w-full">
                {status === 'pending' ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-stone-400 font-medium">
                            <svg className="animate-spin h-4 w-4 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs">Waiting for payment verification...</span>
                        </div>
                        <p className="text-[10px] text-stone-100 font-medium italic">
                            Order will be processed once payment is confirmed.
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-1">
                        <p className="text-sm text-green-600 font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="bg-green-100 p-1 rounded-full">✓</span>
                            Payment Verified!
                        </p>
                        <p className="text-xs text-stone-500 font-medium italic">
                            Processing your order now...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
