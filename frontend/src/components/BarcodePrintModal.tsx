'use client';

import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FiPrinter, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { BarcodeLabel } from './BarcodeLabel';

interface Product {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    selling_price: number;
    brand?: { name: string };
}

interface BarcodePrintModalProps {
    products: Product[];
    onClose: () => void;
}

export const BarcodePrintModal = ({ products, onClose }: BarcodePrintModalProps) => {
    const labelRef = useRef<HTMLDivElement>(null);
    const [copies, setCopies] = useState(1);
    const [showPrice, setShowPrice] = useState(true);
    const [showSku, setShowSku] = useState(true);
    const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium');

    const handlePrint = useReactToPrint({
        content: () => labelRef.current,
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiPrinter className="w-5 h-5" />
                        Print Barcodes ({products.length} products)
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Settings */}
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-700/50 shrink-0">
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Number of copies */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copies:</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCopies(Math.max(1, copies - 1))}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                >
                                    <FiMinus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{copies}</span>
                                <button
                                    onClick={() => setCopies(Math.min(20, copies + 1))}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                >
                                    <FiPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Label size */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</span>
                            <select
                                value={labelSize}
                                onChange={(e) => setLabelSize(e.target.value as 'small' | 'medium' | 'large')}
                                className="input py-1 px-2 text-sm"
                            >
                                <option value="small">Small (38×25mm)</option>
                                <option value="medium">Medium (50×30mm)</option>
                                <option value="large">Large (60×40mm)</option>
                            </select>
                        </div>

                        {/* Show price toggle */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPrice}
                                onChange={(e) => setShowPrice(e.target.checked)}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Show Price</span>
                        </label>

                        {/* Show SKU toggle */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showSku}
                                onChange={(e) => setShowSku(e.target.checked)}
                                className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Show SKU</span>
                        </label>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
                    <div className="bg-white rounded-lg shadow p-4 inline-block min-w-full">
                        <BarcodeLabel
                            ref={labelRef}
                            products={products}
                            copies={copies}
                            showPrice={showPrice}
                            showSku={showSku}
                            labelSize={labelSize}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="btn btn-outline">
                        Cancel
                    </button>
                    <button onClick={() => handlePrint()} className="btn btn-primary">
                        <FiPrinter className="w-4 h-4" />
                        Print {products.length * copies} Labels
                    </button>
                </div>
            </div>
        </div>
    );
};
