'use client';

import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface ReceiptProps {
    sale: any;
    businessInfo: {
        name: string;
        address: string;
        phone: string;
        logo?: string;
    };
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ sale, businessInfo }, ref) => {
    if (!sale) return null;

    const totalKhr = Math.round(sale.total_usd * parseFloat(sale.exchange_rate) / 100) * 100;

    // Safe date formatting
    const formatDate = (dateValue: any): string => {
        if (!dateValue) return 'N/A';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'N/A';
            return format(date, 'dd/MM/yyyy HH:mm');
        } catch {
            return 'N/A';
        }
    };

    return (
        <div ref={ref} className="p-4 bg-white text-black font-mono text-sm w-[80mm] mx-auto">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold uppercase">{businessInfo.name}</h1>
                <p className="whitespace-pre-line">{businessInfo.address}</p>
                <p>Tel: {businessInfo.phone}</p>
            </div>

            <div className="border-t border-b border-black py-2 mb-4">
                <div className="flex justify-between">
                    <span>Invoice:</span>
                    <span className="font-bold">{sale.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{formatDate(sale.created_at)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{sale.cashier?.full_name || 'N/A'}</span>
                </div>
                {sale.customer && (
                    <div className="flex justify-between">
                        <span>Customer:</span>
                        <span>{sale.customer.name}</span>
                    </div>
                )}
            </div>

            {/* Items */}
            <table className="w-full mb-4">
                <thead>
                    <tr className="border-b border-black">
                        <th className="text-left py-1">Item</th>
                        <th className="text-center py-1">Qty</th>
                        <th className="text-right py-1">Price</th>
                        <th className="text-right py-1">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 italic">
                    {sale.items?.map((item: any, index: number) => (
                        <tr key={index}>
                            <td className="py-1">
                                <div className="font-bold">{item.product?.name || item.name}</div>
                                {item.imei && <div className="text-xs">IMEI: {item.imei}</div>}
                            </td>
                            <td className="text-center py-1">{item.quantity}</td>
                            <td className="text-right py-1">${parseFloat(item.unit_price).toFixed(2)}</td>
                            <td className="text-right py-1">${parseFloat(item.total).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-black pt-2 space-y-1">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total USD:</span>
                    <span>${parseFloat(sale.total_usd).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                    <span>Total KHR:</span>
                    <span>៛{totalKhr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1">
                    <span>Rate:</span>
                    <span>៛{parseFloat(sale.exchange_rate).toLocaleString()}/$</span>
                </div>

                <div className="border-t border-dotted border-black my-2" />

                <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="capitalize">{sale.payment_method}</span>
                </div>
                <div className="flex justify-between">
                    <span>Paid USD:</span>
                    <span>${parseFloat(sale.paid_usd).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Paid KHR:</span>
                    <span>៛{parseFloat(sale.paid_khr).toLocaleString()}</span>
                </div>

                {(parseFloat(sale.change_usd) > 0 || parseFloat(sale.change_khr) > 0) && (
                    <div className="flex justify-between font-bold text-green-700 border-t border-gray-200 mt-1 pt-1">
                        <span>Change:</span>
                        <span>
                            {parseFloat(sale.change_usd) > 0 && `$${parseFloat(sale.change_usd).toFixed(2)} `}
                            {parseFloat(sale.change_khr) > 0 && `៛${parseFloat(sale.change_khr).toLocaleString()}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-xs">
                <p className="font-bold">Thank you for your business!</p>
                <p>Warranties are tracked by IMEI.</p>
                <p className="mt-2 font-khmer">សូមអរគុណ!</p>
            </div>
        </div>
    );
});

Receipt.displayName = 'Receipt';
