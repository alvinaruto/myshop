import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateKHQR, DEFAULT_KHQR_CONFIG, generateMd5 } from '@/lib/khqr.util';
import { toast } from 'react-hot-toast';

interface KHQRProps {
    amount: number;
    currency: 'USD' | 'KHR';
    billNumber?: string;
    onPaymentSuccess?: (data: any) => void;
    width?: number; // Allows POS to scale it down, defaults to 240
}

// Helper to get the current proxy URL from localStorage or env
const getProxyUrl = () => {
    // Priority: 1. LocalStorage (for manual testing) 2. NextPublic Env (for easier config) 3. Ngrok/Local Fallback
    if (typeof window === 'undefined') return 'https://risible-marcos-entertainedly.ngrok-free.dev';

    return localStorage.getItem('bakong_proxy_url')
        || process.env.NEXT_PUBLIC_BAKONG_PROXY_URL
        || 'https://risible-marcos-entertainedly.ngrok-free.dev';
};

export const KHQR = ({ amount, currency, billNumber, onPaymentSuccess, width = 250 }: KHQRProps) => {
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
        <div className="flex flex-col items-center max-w-full">
            {/* Import Nunito Sans for official branding */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;900&display=swap');
                .khqr-card {
                    font-family: 'Nunito Sans', sans-serif;
                }
            `}</style>

            {/* Official KHQR Card Style (20:29 Ratio) */}
            <div
                className="khqr-card bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col relative border border-stone-200 aspect-[20/29] max-w-full"
                style={{ width: `${width}px` }}
            >
                {/* Official RED Header: #E1232E */}
                <div className="bg-[#E1232E] w-full h-[18%] flex items-center justify-center relative shrink-0">
                    <span className="text-white font-black text-2xl tracking-tighter">KHQR</span>
                    
                    {/* The signature diagonal cut on the bottom right of the red header block */}
                    <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[24px] border-b-white border-l-[24px] border-l-transparent"></div>
                </div>

                {/* White Body */}
                <div className="flex-1 px-5 pt-3 pb-4 flex flex-col relative w-full bg-white">
                    {/* Merchant Info */}
                    <div className="w-full text-left">
                        <p className="font-bold text-stone-500 uppercase tracking-widest text-[9px] leading-relaxed truncate">
                            {DEFAULT_KHQR_CONFIG.merchantName}
                        </p>
                        <p className="font-black text-stone-900 leading-none" style={{ fontSize: `${width * 0.12}px` }}>
                            {currency === 'USD' ? '$' : '៛'}{amount > 0 && amount % 1 !== 0 ? amount.toFixed(2) : amount}
                        </p>
                    </div>

                    {/* Dashed Separator */}
                    <div className="w-full border-t-2 border-dashed border-stone-200 mt-4 mb-3 relative"></div>

                    {/* QR Code Section */}
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-0 w-full">
                        <QRCodeSVG
                            value={khqrString}
                            size={width * 0.68} /* Size relative to card width */
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "https://bakong.nbc.gov.kh/images/bakong_logo.png",
                                height: width * 0.15,
                                width: width * 0.15,
                                excavate: false,
                            }}
                        />

                        {/* Status Overlay */}
                        {status === 'success' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-20">
                                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 mb-2">
                                        <span className="text-white text-2xl">✓</span>
                                    </div>
                                    <span className="text-green-600 font-black uppercase text-sm tracking-widest">Paid</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Bakong Pulse for Waiting state */}
                {status === 'pending' && (
                    <div className="absolute top-[58%] right-4 pointer-events-none">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E1232E] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E1232E]"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Status Feedback (External to card) */}
            <div className="mt-4 text-center px-4 w-full">
                {status === 'pending' ? (
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                            Scan to pay
                        </p>
                        <div className="flex items-center gap-2 text-amber-500 font-medium pt-1">
                            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-xs">Waiting for payment...</span>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                        <p className="text-sm text-green-600 font-black uppercase tracking-widest flex items-center gap-2">
                            <span className="bg-green-100 px-1.5 py-0.5 rounded-full text-[10px]">✓</span>
                            Payment Verified
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
