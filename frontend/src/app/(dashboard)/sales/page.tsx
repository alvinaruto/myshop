'use client';

import { useState, useEffect, useRef } from 'react';
import { saleApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { FiEye, FiSearch, FiPrinter, FiXCircle, FiX } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import { Receipt } from '@/components/Receipt';

interface Sale {
    id: string;
    invoice_number: string;
    total_usd: number;
    paid_usd: number;
    paid_khr: number;
    change_khr: number;
    exchange_rate: number;
    payment_method: string;
    status: string;
    created_at: string;
    cashier?: { full_name: string };
    customer?: { name: string; phone: string };
}

export default function SalesPage() {
    const { user, canDeleteSales } = useAuthStore();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    const [selectedSale, setSelectedSale] = useState<any | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadSales();
    }, [page, startDate, endDate]);

    const loadSales = async () => {
        setLoading(true);
        try {
            const res = await saleApi.getAll({
                page,
                limit: 20,
                start_date: startDate,
                end_date: endDate,
            });
            setSales(res.data.data.sales);
            setTotalPages(res.data.data.pagination.totalPages);
        } catch (error) {
            toast.error('Failed to load sales');
        } finally {
            setLoading(false);
        }
    };

    const viewSale = async (id: string) => {
        try {
            const res = await saleApi.getById(id);
            setSelectedSale(res.data.data);
        } catch (error) {
            toast.error('Failed to load sale details');
        }
    };

    const voidSale = async (id: string) => {
        if (!confirm('Are you sure you want to void this sale? Stock will be restored.')) return;

        try {
            await saleApi.void(id);
            toast.success('Sale voided');
            loadSales();
            setSelectedSale(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to void sale');
        }
    };

    const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_usd.toString()), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales History</h1>
                    <p className="text-gray-500">View and manage sales transactions</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">Period Total</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">${totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input"
                        />
                    </div>
                    <button onClick={loadSales} className="btn btn-primary">
                        <FiSearch className="w-4 h-4" />
                        Search
                    </button>
                </div>
            </div>

            {/* Sales Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Payment</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                            ) : sales.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No sales found</td></tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 font-mono text-sm">{sale.invoice_number}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(sale.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{sale.cashier?.full_name}</td>
                                        <td className="px-4 py-3 text-right font-bold">${parseFloat(sale.total_usd.toString()).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase">{sale.payment_method}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs uppercase ${sale.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => viewSale(sale.id)} className="p-2 hover:bg-gray-100 rounded-lg" title="View Details">
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                {canDeleteSales() && sale.status === 'completed' && (
                                                    <button onClick={() => voidSale(sale.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Void Sale">
                                                        <FiXCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="btn btn-outline btn-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="btn btn-outline btn-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Sale Detail Modal with Print */}
            {selectedSale && (
                <SaleDetailModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                    onVoid={canDeleteSales() && selectedSale.status === 'completed' ? () => voidSale(selectedSale.id) : undefined}
                />
            )}
        </div>
    );
}

function SaleDetailModal({ sale, onClose, onVoid }: { sale: any; onClose: () => void; onVoid?: () => void }) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invoice: {sale.invoice_number}</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePrint()}
                            className="btn btn-primary btn-sm"
                            title="Print Invoice"
                        >
                            <FiPrinter className="w-4 h-4" />
                            Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">{new Date(sale.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Cashier</p>
                            <p className="font-medium text-gray-900 dark:text-white">{sale.cashier?.full_name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Payment Method</p>
                            <p className="font-medium uppercase text-gray-900 dark:text-white">{sale.payment_method}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Exchange Rate</p>
                            <p className="font-medium text-gray-900 dark:text-white">$1 = ៛{parseFloat(sale.exchange_rate).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Items</h4>
                        <div className="space-y-2">
                            {sale.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{item.product?.name}</p>
                                        {item.serialItem && (
                                            <p className="text-sm text-gray-500 font-mono">
                                                IMEI: {item.serialItem.imei || item.serialItem.serial_number}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900 dark:text-white">${parseFloat(item.total).toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} × ${parseFloat(item.unit_price).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-primary-600">${parseFloat(sale.total_usd).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Paid (USD)</span>
                            <span>${parseFloat(sale.paid_usd).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Paid (KHR)</span>
                            <span>៛{parseFloat(sale.paid_khr).toLocaleString()}</span>
                        </div>
                        {parseFloat(sale.change_khr) > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Change (KHR)</span>
                                <span>៛{parseFloat(sale.change_khr).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {/* Void Button */}
                    {onVoid && (
                        <div className="border-t pt-4">
                            <button
                                onClick={onVoid}
                                className="w-full btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <FiXCircle className="w-4 h-4" />
                                Void This Sale
                            </button>
                        </div>
                    )}
                </div>

                {/* Hidden Receipt for Printing */}
                <div className="hidden">
                    <Receipt
                        ref={receiptRef}
                        sale={sale}
                        businessInfo={{
                            name: 'MyShop Phone Store',
                            address: 'Phnom Penh, Cambodia',
                            phone: '012 345 678'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
