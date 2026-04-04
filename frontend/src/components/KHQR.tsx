'use client';

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

export const KHQR = ({ amount, currency, billNumber, onPaymentSuccess, width = 280 }: KHQRProps) => {
    const [status, setStatus] = useState<'pending' | 'success'>('pending');
    const [khqrString, setKhqrString] = useState<string>('');
    const [md5, setMd5] = useState<string>('');
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const generatedString = generateKHQR({
            amount,
            currency,
            merchantName: DEFAULT_KHQR_CONFIG.merchantName,
            accountNumber: DEFAULT_KHQR_CONFIG.accountNumber,
            bankCode: DEFAULT_KHQR_CONFIG.bankCode,
            merchantCity: DEFAULT_KHQR_CONFIG.merchantCity,
            billNumber: billNumber,
        });

        setKhqrString(generatedString);
        setMd5(generateMd5(generatedString));
    }, [amount, currency, billNumber]);

    // ── Derived sizes based on width ──
    const cardHeight = width * (29 / 20);
    // As per the official generic spec, red header is shorter on the left and drops down on the right
    const shortHeaderHeight = width * 0.20;
    const tallHeaderHeight = width * 0.30;
    // 45-degree slant down-right means the tab width is the difference in heights
    const tabWidth = tallHeaderHeight - shortHeaderHeight;

    // Perfect mathematical alignment for padding and QR size
    const sidePadding = width * 0.11;
    const qrSize = width * 0.78; // width - (2 * sidePadding)
    const logoSize = qrSize * 0.18;
    const cornerRadius = width * 0.055;

    // ── Polling effect ──
    useEffect(() => {
        if (status === 'success' || !md5) return;

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

    // ── Formatted amount ──
    const formattedAmount = (() => {
        if (amount === 0) return '0';
        if (currency === 'KHR') return amount.toLocaleString();
        return amount % 1 !== 0 ? amount.toFixed(2) : String(amount);
    })();

    // Currency label shown after the amount (official style)
    const currencyLabel = currency;

    return (
        <div className="flex flex-col items-center max-w-full">
            {/* ═══════════ OFFICIAL KHQR CARD ═══════════ */}
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
                {/* ═══════════ RED HEADER with drop-down tab ═══════════ */}
                <div style={{ position: 'relative', width: '100%', height: `${shortHeaderHeight}px`, flexShrink: 0, zIndex: 10 }}>
                    {/* Red background — SVG polygon for the downward tab shape */}
                    <svg
                        width={width}
                        height={tallHeaderHeight}
                        viewBox={`0 0 ${width} ${tallHeaderHeight}`}
                        style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
                        preserveAspectRatio="none"
                    >
                        {/* 
                            Points: 
                            - Top-left: 0,0
                            - Top-right: width,0
                            - Bottom-right: width, tallHeaderHeight
                            - Slant start: width - tabWidth, shortHeaderHeight
                            - Bottom-left: 0, shortHeaderHeight
                        */}
                        <polygon
                            points={`0,0 ${width},0 ${width},${tallHeaderHeight} ${width - tabWidth},${shortHeaderHeight} 0,${shortHeaderHeight}`}
                            fill="#E1232E"
                        />
                    </svg>

                    {/* KHQR Logo Text — centered horizontally, aligned to short height vertically */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${shortHeaderHeight}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Official KHQR Vector Logo */}
                        {/* Official KHQR Logomark Image */}
                        <img
                            src="/official-khqr-logo.png"
                            alt="KHQR"
                            style={{ 
                                display: 'block',
                                height: `${shortHeaderHeight * 0.45}px`,
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                </div>

                {/* ═══════════ WHITE BODY ═══════════ */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: `${width * 0.08}px ${sidePadding}px ${width * 0.108}px`,
                        position: 'relative',
                        zIndex: 5,
                    }}
                >
                    {/* Merchant Name — normal case, regular weight (matches official) */}
                    <p
                        style={{
                            fontWeight: 400,
                            fontSize: `${cardHeight * 0.032}px`,
                            color: '#333333',
                            margin: 0,
                            lineHeight: 1.4,
                        }}
                    >
                        {DEFAULT_KHQR_CONFIG.merchantName}
                    </p>

                    {/* Amount + Currency Code (official style: "1,300,000 KHR" or "1.75 USD") */}
                    <p
                        style={{
                            fontWeight: 800,
                            fontSize: `${cardHeight * 0.065}px`,
                            color: '#000000',
                            margin: `${width * 0.01}px 0 0 0`,
                            lineHeight: 1.15,
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: `${width * 0.02}px`,
                        }}
                    >
                        <span>{formattedAmount}</span>
                        <span
                            style={{
                                fontWeight: 500,
                                fontSize: `${cardHeight * 0.032}px`,
                                color: '#333333',
                            }}
                        >
                            {currencyLabel}
                        </span>
                    </p>

                    {/* Dashed Separator — official style: gray dashes, full width */}
                    <div
                        style={{
                            width: '100%',
                            borderTop: '1px dashed #b0b0b0',
                            margin: `${width * 0.045}px 0`,
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
                        <div style={{ position: 'relative', lineHeight: 0, width: qrSize, height: qrSize }}>
                            {khqrString && (
                                <QRCodeSVG
                                    value={khqrString}
                                    size={qrSize}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: '/bakong-logo.png',
                                        height: logoSize,
                                        width: logoSize,
                                        excavate: true,
                                    }}
                                />
                            )}
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
