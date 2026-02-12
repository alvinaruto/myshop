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

export const KHQR = ({ amount, currency, billNumber, onPaymentSuccess }: KHQRProps) => {
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [retryCount, setRetryCount] = useState(0);
    const md5Ref = useRef<string>('');
    const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

    const khqrString = generateKHQR({
        amount,
        currency,
        merchantName: DEFAULT_KHQR_CONFIG.merchantName,
        accountNumber: DEFAULT_KHQR_CONFIG.accountNumber,
        bankCode: DEFAULT_KHQR_CONFIG.bankCode,
        merchantCity: DEFAULT_KHQR_CONFIG.merchantCity,
        billNumber: billNumber || `INV${Date.now().toString().slice(-8)}`
    });

    // Generate MD5 once when khqrString changes
    useEffect(() => {
        md5Ref.current = generateMd5(khqrString);
    }, [khqrString]);

    // Polling effect
    useEffect(() => {
        if (status === 'success') return;

        const checkPayment = async () => {
            try {
                if (!md5Ref.current) return;

                const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/sales/verify-khqr`, {
                    md5: md5Ref.current
                });

                if (response.data.success) {
                    setStatus('success');
                    toast.success('Payment Verified Successfully!');
                    if (onPaymentSuccess) {
                        onPaymentSuccess(response.data.data);
                    }
                    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
                } else {
                    // Continue polling
                    pollTimerRef.current = setTimeout(checkPayment, 3000); // Poll every 3 seconds
                }
            } catch (error) {
                console.error('Error checking payment:', error);
                // Continue polling even on error, but maybe slower?
                pollTimerRef.current = setTimeout(checkPayment, 5000);
            }
        };

        // Start polling
        pollTimerRef.current = setTimeout(checkPayment, 3000);

        return () => {
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        };
    }, [khqrString, status, onPaymentSuccess]);

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

            <div className={`relative p-4 bg-white border-8 rounded-xl transition-colors duration-500 ${status === 'success' ? 'border-green-500' : 'border-primary-50'
                }`}>
                <QRCodeSVG
                    value={khqrString}
                    size={200}
                    level="H"
                    includeMargin={false}
                />

                {status === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                        <div className="text-green-600 font-bold text-xl flex flex-col items-center animate-bounce">
                            <span>✓</span>
                            <span>Paid</span>
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-4 text-xs text-center text-gray-500 max-w-[180px]">
                {status === 'pending' ? 'Scan with Bakong, ACLEDA, ABA, or any KHQR-supported banking app' : 'Payment Completed'}
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
