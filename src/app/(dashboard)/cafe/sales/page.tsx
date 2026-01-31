'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiCalendar, FiDownload, FiEye, FiXCircle, FiLoader, FiChevronLeft, FiChevronRight, FiCoffee } from 'react-icons/fi';

interface CafeOrder {
    id: string;
    order_number: string;
    total_usd: number;
    paid_usd: number;
    paid_khr: number;
    change_usd: number;
    change_khr: number;
    payment_method: string;
    status: string;
    createdAt: string;
    cashier?: { full_name: string };
    items?: Array<{
        name: string;
        size: string;
        quantity: number;
        unit_price: number;
        total: number;
    }>;
}

const formatPrice = (value: any): string => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

export default function CafeSalesPage() {
    const [orders, setOrders] = useState<CafeOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<CafeOrder | null>(null);
    const [showVoidModal, setShowVoidModal] = useState(false);
    const [voidReason, setVoidReason] = useState('');
    const [voidingOrder, setVoidingOrder] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });
            if (search) params.append('search', search);
            if (dateFrom) params.append('from', dateFrom);
            if (dateTo) params.append('to', dateTo);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await fetch(`/api/cafe/orders?${params}`);
            const data = await res.json();
            if (data.success) {
                // Handle both array and object response formats
                const ordersData = Array.isArray(data.data) ? data.data : (data.data?.orders || data.data || []);
                setOrders(ordersData);
                setTotalPages(data.data?.totalPages || Math.ceil(ordersData.length / 20) || 1);
                setTotalOrders(data.data?.total || ordersData.length || 0);
            }
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const handleVoidOrder = async () => {
        if (!voidingOrder || !voidReason.trim()) {
            toast.error('Please provide a reason for voiding');
            return;
        }

        try {
            const res = await fetch(`/api/cafe/orders/${voidingOrder}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'voided', void_reason: voidReason })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Order voided successfully');
                setShowVoidModal(false);
                setVoidReason('');
                setVoidingOrder(null);
                fetchOrders();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to void order');
        }
    };

    const exportToCSV = () => {
        const headers = ['Order #', 'Date', 'Time', 'Items', 'Total', 'Payment', 'Status', 'Cashier'];
        const rows = orders.map(order => [
            order.order_number,
            new Date(order.createdAt).toLocaleDateString(),
            new Date(order.createdAt).toLocaleTimeString(),
            order.items?.length || 0,
            `$${formatPrice(order.total_usd)}`,
            order.payment_method,
            order.status,
            order.cashier?.full_name || 'N/A'
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cafe-sales-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            voided: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            ready: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiCoffee className="text-amber-500" />
                        Café Sales History
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage café orders</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="btn btn-outline flex items-center gap-2"
                >
                    <FiDownload className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by order number..."
                                className="input pl-10 w-full"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400" />
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="input"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="input"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="voided">Voided</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                    </select>
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>
                </form>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                        ${formatPrice(orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(String(o.total_usd)), 0))}
                    </p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {orders.filter(o => o.status === 'completed').length}
                    </p>
                </div>
                <div className="card p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Voided</p>
                    <p className="text-2xl font-bold text-red-500">
                        {orders.filter(o => o.status === 'voided').length}
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FiCoffee className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                            {order.order_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                            ${formatPrice(order.total_usd)}
                                        </td>
                                        <td className="px-4 py-3 text-sm capitalize">
                                            {order.payment_method}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {order.cashier?.full_name || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                    title="View Details"
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                </button>
                                                {order.status === 'completed' && (
                                                    <button
                                                        onClick={() => {
                                                            setVoidingOrder(order.id);
                                                            setShowVoidModal(true);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                        title="Void Order"
                                                    >
                                                        <FiXCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700">
                        <p className="text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-outline btn-sm"
                            >
                                <FiChevronLeft />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="btn btn-outline btn-sm"
                            >
                                <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                Order {selectedOrder.order_number}
                            </h3>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FiXCircle className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Date</p>
                                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-500">Payment</p>
                                    <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Cashier</p>
                                    <p className="font-medium">{selectedOrder.cashier?.full_name || '—'}</p>
                                </div>
                            </div>

                            <div className="border-t dark:border-gray-700 pt-4">
                                <p className="font-medium mb-2">Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.name} ({item.size})</span>
                                            <span>${formatPrice(item.total)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t dark:border-gray-700 pt-4 space-y-1">
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span>${formatPrice(selectedOrder.total_usd)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Paid USD</span>
                                    <span>${formatPrice(selectedOrder.paid_usd)}</span>
                                </div>
                                {parseFloat(String(selectedOrder.paid_khr)) > 0 && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Paid KHR</span>
                                        <span>៛{parseInt(String(selectedOrder.paid_khr)).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Void Modal */}
            {showVoidModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Void Order</h3>
                        <p className="text-sm text-gray-500 mb-4">Please provide a reason for voiding this order:</p>
                        <textarea
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                            placeholder="Reason for voiding..."
                            className="input w-full h-24 mb-4"
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowVoidModal(false);
                                    setVoidReason('');
                                    setVoidingOrder(null);
                                }}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVoidOrder}
                                className="flex-1 btn bg-red-600 text-white hover:bg-red-700"
                            >
                                Void Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
