'use client';

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ProductLabelProps {
    product: {
        name: string;
        sku: string;
        selling_price: number;
        barcode?: string;
    };
}

export const ProductLabel = forwardRef<HTMLDivElement, ProductLabelProps>(({ product }, ref) => {
    return (
        <div ref={ref} className="p-2 bg-white text-black border border-gray-200 w-[50mm] h-[30mm] flex flex-col justify-between items-center overflow-hidden">
            <div className="text-center">
                <p className="text-[10px] font-bold truncate w-full uppercase">{product.name}</p>
                <p className="text-[8px] text-gray-600">{product.sku}</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <QRCodeSVG
                    value={product.barcode || product.sku}
                    size={60}
                    level="L"
                />
            </div>

            <div className="text-center w-full border-t border-dotted border-gray-300 pt-1">
                <p className="text-xs font-black">${parseFloat(product.selling_price.toString()).toFixed(2)}</p>
                <p className="text-[8px] font-mono">{product.barcode || product.sku}</p>
            </div>
        </div>
    );
});

ProductLabel.displayName = 'ProductLabel';
