'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FiCamera, FiX, FiRefreshCw } from 'react-icons/fi';

interface BarcodeScannerProps {
    onScan: (code: string) => void;
    onClose: () => void;
}

export const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const hasScannedRef = useRef(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === 2) { // SCANNING state
                    await scannerRef.current.stop();
                }
            } catch (e) {
                // Ignore stop errors
            }
        }
        setIsScanning(false);
    }, []);

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        // Prevent multiple scans
        if (hasScannedRef.current) return;
        hasScannedRef.current = true;

        // Stop scanner first
        await stopScanner();

        // Then call the callback
        onScan(decodedText);
        onClose();
    }, [onScan, onClose, stopScanner]);

    const startScanner = async (facing: 'environment' | 'user') => {
        try {
            setError(null);
            hasScannedRef.current = false;

            // Stop existing scanner if running
            await stopScanner();

            // Small delay to ensure cleanup
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode('barcode-scanner', {
                    formatsToSupport: [
                        Html5QrcodeSupportedFormats.QR_CODE,
                        Html5QrcodeSupportedFormats.EAN_13,
                        Html5QrcodeSupportedFormats.EAN_8,
                        Html5QrcodeSupportedFormats.CODE_128,
                        Html5QrcodeSupportedFormats.CODE_39,
                        Html5QrcodeSupportedFormats.UPC_A,
                        Html5QrcodeSupportedFormats.UPC_E,
                    ],
                    verbose: false
                });
            }

            await scannerRef.current.start(
                { facingMode: facing },
                {
                    fps: 5, // Reduced FPS to prevent rapid scanning
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1
                },
                handleScanSuccess,
                () => {
                    // Error callback - ignore continuous errors during scanning
                }
            );

            setIsScanning(true);
            setFacingMode(facing);
        } catch (err: any) {
            console.error('Scanner error:', err);
            setError(err.message || 'Failed to start camera');
            setIsScanning(false);
        }
    };

    const toggleCamera = () => {
        const newFacing = facingMode === 'environment' ? 'user' : 'environment';
        startScanner(newFacing);
    };

    useEffect(() => {
        // Delay start to ensure DOM is ready
        const timer = setTimeout(() => {
            startScanner('environment');
        }, 200);

        return () => {
            clearTimeout(timer);
            stopScanner();
            if (scannerRef.current) {
                scannerRef.current = null;
            }
        };
    }, []);

    const handleClose = async () => {
        await stopScanner();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiCamera className="w-5 h-5" />
                        Scan Barcode / QR
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleCamera}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Switch Camera"
                        >
                            <FiRefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scanner Area */}
                <div className="relative">
                    <div
                        id="barcode-scanner"
                        className="w-full aspect-square bg-black"
                    />

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                            <div className="text-center p-4">
                                <p className="text-red-400 mb-4">{error}</p>
                                <button
                                    onClick={() => startScanner(facingMode)}
                                    className="btn btn-primary"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">
                        {facingMode === 'environment' ? '📷 Back Camera' : '🤳 Front Camera'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Position the barcode within the frame
                    </p>
                </div>
            </div>
        </div>
    );
};
