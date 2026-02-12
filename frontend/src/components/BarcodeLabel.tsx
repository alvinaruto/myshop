'use client';

import React, { forwardRef } from 'react';
import Barcode from 'react-barcode';

interface Product {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    selling_price: number;
    brand?: { name: string };
}

interface BarcodeLabelProps {
    products: Product[];
    copies?: number;
    showPrice?: boolean;
    showSku?: boolean;
    labelSize?: 'small' | 'medium' | 'large';
}

const labelStyles = {
    small: { width: '38mm', height: '25mm', fontSize: '8px', barcodeHeight: 30 },
    medium: { width: '50mm', height: '30mm', fontSize: '10px', barcodeHeight: 40 },
    large: { width: '60mm', height: '40mm', fontSize: '12px', barcodeHeight: 50 },
};

export const BarcodeLabel = forwardRef<HTMLDivElement, BarcodeLabelProps>(
    ({ products, copies = 1, showPrice = true, showSku = true, labelSize = 'medium' }, ref) => {
        const style = labelStyles[labelSize];

        // Generate labels array with copies
        const labels: Product[] = [];
        products.forEach(product => {
            for (let i = 0; i < copies; i++) {
                labels.push(product);
            }
        });

        return (
            <div ref={ref} className="bg-white">
                <style>
                    {`
                        @media print {
                            @page {
                                size: auto;
                                margin: 2mm;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            .barcode-label-container {
                                page-break-inside: avoid;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    `}
                </style>
                <div className="flex flex-wrap gap-1 p-2">
                    {labels.map((product, index) => {
                        const barcodeValue = product.barcode || product.sku || product.id.slice(0, 12);

                        return (
                            <div
                                key={`${product.id}-${index}`}
                                className="barcode-label-container border border-gray-300 p-1 flex flex-col items-center justify-center text-center"
                                style={{
                                    width: style.width,
                                    height: style.height,
                                    fontSize: style.fontSize,
                                }}
                            >
                                {/* Product Name */}
                                <div
                                    className="font-bold text-black truncate w-full px-1"
                                    style={{ fontSize: style.fontSize }}
                                >
                                    {product.name}
                                </div>

                                {/* Brand */}
                                {product.brand?.name && (
                                    <div
                                        className="text-gray-600 truncate w-full"
                                        style={{ fontSize: `calc(${style.fontSize} - 1px)` }}
                                    >
                                        {product.brand.name}
                                    </div>
                                )}

                                {/* Barcode */}
                                <div className="my-1">
                                    {barcodeValue && barcodeValue.length > 0 ? (
                                        <Barcode
                                            value={barcodeValue}
                                            width={1.2}
                                            height={style.barcodeHeight}
                                            fontSize={8}
                                            margin={2}
                                            displayValue={showSku}
                                            format="CODE128"
                                            background="#ffffff"
                                            lineColor="#000000"
                                        />
                                    ) : (
                                        <div className="text-xs text-gray-400 italic">No barcode</div>
                                    )}
                                </div>

                                {/* Price */}
                                {showPrice && (
                                    <div
                                        className="font-bold text-black"
                                        style={{ fontSize: `calc(${style.fontSize} + 2px)` }}
                                    >
                                        ${product.selling_price}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

BarcodeLabel.displayName = 'BarcodeLabel';
