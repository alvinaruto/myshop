import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateKHQR, DEFAULT_KHQR_CONFIG, generateMd5 } from '@/lib/khqr.util';
import { toast } from 'react-hot-toast';

interface KHQRProps {
    amount: number;
    currency: 'USD' | 'KHR';
    billNumber?: string;
    onPaymentSuccess?: (data: any) => void;
    width?: number;
}

// Helper to get the current proxy URL from localStorage or env
const getProxyUrl = () => {
    if (typeof window === 'undefined') return 'https://risible-marcos-entertainedly.ngrok-free.dev';

    return localStorage.getItem('bakong_proxy_url')
        || process.env.NEXT_PUBLIC_BAKONG_PROXY_URL
        || 'https://risible-marcos-entertainedly.ngrok-free.dev';
};

// Inline SVG data URI for the Bakong logo center mark (red circle with white lotus symbol)
// This avoids CORS issues with external URLs
const BAKONG_CENTER_LOGO = '/images/bakong-logo.png';

export const KHQR = ({ amount, currency, billNumber, onPaymentSuccess, width = 280 }: KHQRProps) => {
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

    // Derived sizes based on width (20:29 ratio)
    const cardHeight = width * (29 / 20);
    const headerHeight = cardHeight * 0.12;
    const qrSize = width * 0.72;
    const logoSize = qrSize * 0.18;
    const cornerRadius = width * 0.06;

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

    const formattedAmount = (() => {
        if (amount === 0) return '0';
        if (currency === 'KHR') return amount.toLocaleString();
        return amount % 1 !== 0 ? amount.toFixed(2) : String(amount);
    })();

    return (
        <div className="flex flex-col items-center max-w-full">
            {/* Import Nunito Sans for official branding */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;800;900&display=swap');
                .khqr-card {
                    font-family: 'Nunito Sans', sans-serif;
                }
            `}</style>

            {/* Official KHQR Card (20:29 Ratio) */}
            <div
                className="khqr-card relative overflow-hidden flex flex-col max-w-full"
                style={{
                    width: `${width}px`,
                    height: `${cardHeight}px`,
                    borderRadius: `${cornerRadius}px`,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
                    background: '#ffffff',
                }}
            >
                {/* ═══════════ RED HEADER ═══════════ */}
                {/* No borderRadius here — the parent card's overflow:hidden + borderRadius clips the top corners */}
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: `${headerHeight}px`,
                        background: '#E1232E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {/* KHQR Text */}
                    <span
                        style={{
                            color: '#fff',
                            fontWeight: 900,
                            fontSize: `${headerHeight * 0.48}px`,
                            letterSpacing: '-0.02em',
                            lineHeight: 1,
                        }}
                    >
                        KHQR
                    </span>

                    {/* Diagonal cut on bottom-right corner — small notch matching official spec */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 0,
                            height: 0,
                            borderBottom: `${headerHeight * 0.45}px solid #ffffff`,
                            borderLeft: `${headerHeight * 0.45}px solid transparent`,
                        }}
                    />
                </div>

                {/* ═══════════ WHITE BODY ═══════════ */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: `${width * 0.05}px ${width * 0.06}px ${width * 0.04}px`,
                        position: 'relative',
                    }}
                >
                    {/* Merchant Name */}
                    <p
                        style={{
                            fontWeight: 700,
                            fontSize: `${cardHeight * 0.03}px`,
                            color: '#1a1a1a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: 0,
                            lineHeight: 1.4,
                        }}
                    >
                        {DEFAULT_KHQR_CONFIG.merchantName}
                    </p>

                    {/* Amount */}
                    <p
                        style={{
                            fontWeight: 900,
                            fontSize: `${cardHeight * 0.065}px`,
                            color: '#1a1a1a',
                            margin: `${width * 0.01}px 0 0 0`,
                            lineHeight: 1.1,
                        }}
                    >
                        {currency === 'USD' ? '$' : '៛'}{formattedAmount}
                    </p>

                    {/* Dashed Separator — official style thin gray dashes */}
                    <div
                        style={{
                            width: '100%',
                            borderTop: '1.5px dashed #d1d5db',
                            margin: `${width * 0.035}px 0`,
                        }}
                    />

                    {/* QR Code Section */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            minHeight: 0,
                        }}
                    >
                        <div style={{ position: 'relative', lineHeight: 0 }}>
                            <QRCodeSVG
                                value={khqrString}
                                size={qrSize}
                                level="H"
                                includeMargin={false}
                                imageSettings={{
                                    src: BAKONG_CENTER_LOGO,
                                    height: logoSize,
                                    width: logoSize,
                                    excavate: true,
                                }}
                            />
                        </div>

                        {/* Success Overlay */}
                        {status === 'success' && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.95)',
                                    zIndex: 20,
                                }}
                            >
                                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            background: '#22c55e',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
                                            marginBottom: 8,
                                        }}
                                    >
                                        <span style={{ color: '#fff', fontSize: 24 }}>✓</span>
                                    </div>
                                    <span
                                        style={{
                                            color: '#16a34a',
                                            fontWeight: 900,
                                            textTransform: 'uppercase',
                                            fontSize: 14,
                                            letterSpacing: '0.1em',
                                        }}
                                    >
                                        Paid
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Verification Status Feedback (External to card) */}
            <div className="mt-4 text-center px-4 w-full">
                {status === 'pending' ? (
                    <div className="flex flex-col items-center gap-1">
                        <p
                            style={{
                                fontSize: 10,
                                color: '#9ca3af',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.12em',
                                fontFamily: "'Nunito Sans', sans-serif",
                            }}
                        >
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
