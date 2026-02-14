import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateKHQR, DEFAULT_KHQR_CONFIG, generateMd5 } from '@/lib/khqr.util';
import { toast } from 'react-hot-toast';

interface KHQRProps {
    amount: number;
    currency: 'USD' | 'KHR';
    billNumber?: string;
    onPaymentSuccess?: (data: any) => void;
}

// Helper to get the current proxy URL from localStorage or env
const getProxyUrl = () => {
    // Priority: 1. LocalStorage (for manual testing) 2. NextPublic Env (for easier config) 3. Ngrok/Local Fallback
    if (typeof window === 'undefined') return 'https://risible-marcos-entertainedly.ngrok-free.dev';

    return localStorage.getItem('bakong_proxy_url')
        || process.env.NEXT_PUBLIC_BAKONG_PROXY_URL
        || 'https://risible-marcos-entertainedly.ngrok-free.dev';
};

export const KHQR = ({ amount, currency, billNumber, onPaymentSuccess }: KHQRProps) => {
    const [status, setStatus] = useState<'pending' | 'success'>('pending');
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Official proportions based on 20:29 ratio
    // If width is 280, height should be 406
    const cardWidth = 280;
    const cardHeight = Math.round((cardWidth / 20) * 29); // 406

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
            const currentProxy = getProxyUrl();

            try {
                const response = await fetch(currentProxy, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Bypass-Tunnel-Reminder': 'true',
                        'ngrok-skip-browser-warning': 'true',
                    },
                    body: JSON.stringify({ md5, externalRef: billNumber }),
                });
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    toast.success('Payment Verified Automatically!');
                    if (onPaymentSuccess) {
                        onPaymentSuccess(data.data);
                    }
                } else {
                    pollTimerRef.current = setTimeout(checkPayment, 3000);
                }
            } catch (error) {
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
            {/* Import Nunito Sans for official branding */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;900&display=swap');
                .khqr-card {
                    font-family: 'Nunito Sans', sans-serif;
                }
            `}</style>

            {/* Official KHQR Card Style (20:29 Ratio) */}
            <div
                className="khqr-card bg-white rounded-[1.5rem] shadow-2xl overflow-hidden flex flex-col relative border border-stone-100"
                style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}
            >
                {/* Official RED Header: #E1232E */}
                <div className="bg-[#E1232E] pt-5 pb-7 px-6 relative">
                    <div className="flex justify-center">
                        <span className="text-white font-black text-2xl italic tracking-tighter">KHQR</span>
                    </div>
                </div>

                {/* White Body */}
                <div className="flex-1 px-8 flex flex-col">
                    {/* Merchant Info: Left Aligned as per Guideline */}
                    <div className="pt-6 pb-2 text-left">
                        <p
                            className="font-bold text-stone-400 uppercase tracking-widest leading-none mb-1"
                            style={{ fontSize: `${cardHeight * 0.03}px` }} // 3% of Height
                        >
                            {DEFAULT_KHQR_CONFIG.merchantName}
                        </p>
                        <p
                            className="font-black text-stone-900 leading-tight"
                            style={{ fontSize: `${cardHeight * 0.065}px` }} // 6.5% of Height
                        >
                            {currency === 'USD' ? '$' : ''}{amount.toFixed(2)}{currency === 'KHR' ? '៛' : ''}
                        </p>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex-1 flex flex-col items-center justify-center -mt-2">
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
                    </div>

                    {/* Footer Instructions */}
                    <div className="pb-8 text-center">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider leading-relaxed">
                            Scan to pay with Bakong<br />or any mobile banking app
                        </p>
                    </div>
                </div>

                {/* Floating Bakong Pulse (Waiting state) */}
                {status === 'pending' && (
                    <div className="absolute top-[160px] right-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25"></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full relative z-10"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Status Text */}
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
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center gap-1">
                        <p className="text-sm text-green-600 font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="bg-green-100 p-1 rounded-full">✓</span>
                            Payment Verified!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
