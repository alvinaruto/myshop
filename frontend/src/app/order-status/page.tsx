'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCoffee, FiClock, FiCheckCircle, FiChevronLeft, FiSearch, FiSend, FiUser } from 'react-icons/fi';

interface QueueOrder {
    id: string;
    order_number: string;
    status: string;
    total_usd?: number;
    createdAt: string;
    items?: Array<{
        name: string;
        quantity: number;
        size: string;
    }>;
}

export default function PublicOrderStatusPage() {
    const [orders, setOrders] = useState<QueueOrder[]>([]);
    const [customerOrders, setCustomerOrders] = useState<QueueOrder[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [phoneNumber, setPhoneNumber] = useState('');
    const [searchedPhone, setSearchedPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/cafe/orders?status=pending,preparing,ready&limit=30');
            const data = await res.json();
            if (data.success) {
                const ordersData = Array.isArray(data.data) ? data.data : (data.data?.orders || data.data || []);
                setOrders(ordersData);
            }
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    };

    const fetchCustomerOrders = async (phone: string) => {
        if (!phone) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('myshop_customer_token');
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/customer/orders?phone=${encodeURIComponent(phone)}`, { headers });
            const data = await res.json();
            if (data.success) {
                setCustomerOrders(data.data || []);
                setSearchedPhone(phone);
            } else if (res.status === 401) {
                setCustomerOrders([]);
                setSearchedPhone(phone);
            }
        } catch (error) {
            console.error('Failed to fetch customer orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const orderInterval = setInterval(fetchOrders, 3000);
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(orderInterval);
            clearInterval(timeInterval);
        };
    }, []);

    // Also refresh customer orders periodically if searched
    useEffect(() => {
        if (searchedPhone) {
            const interval = setInterval(() => fetchCustomerOrders(searchedPhone), 5000);
            return () => clearInterval(interval);
        }
    }, [searchedPhone]);

    const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'pending');
    const readyOrders = orders.filter(o => o.status === 'ready');

    const getShortOrderNumber = (orderNumber: string) => {
        return orderNumber.split('-').pop() || orderNumber;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-xs font-bold">Queued</span>;
            case 'preparing':
                return <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">Preparing</span>;
            case 'ready':
                return <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">Ready!</span>;
            case 'completed':
                return <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-xs font-bold">Completed</span>;
            default:
                return <span className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-amber-900">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-sm border-b border-amber-800/30">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/menu" className="flex items-center gap-2 text-amber-300 hover:text-amber-200 transition">
                        <FiChevronLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back to Menu</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                            <FiCoffee className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">myShop Coffee</h1>
                            <p className="text-amber-400 text-xs">Order Status</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white tabular-nums">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-amber-400 text-sm">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Phone Search Section */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FiUser className="w-5 h-5 text-amber-400" />
                        Track Your Order
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter your phone number"
                            className="flex-1 px-4 py-3 bg-white/10 border border-amber-500/30 rounded-xl text-white placeholder-amber-200/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            onKeyDown={(e) => e.key === 'Enter' && fetchCustomerOrders(phoneNumber)}
                        />
                        <button
                            onClick={() => fetchCustomerOrders(phoneNumber)}
                            disabled={!phoneNumber || loading}
                            className="px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiSearch className="w-5 h-5" />
                            )}
                            Search
                        </button>
                    </div>

                    {/* Customer Orders */}
                    {searchedPhone && (
                        <div className="mt-6">
                            <h3 className="text-amber-300 font-medium mb-3">
                                Orders for {searchedPhone}
                            </h3>
                            {customerOrders.length === 0 ? (
                                <p className="text-amber-200/60">No orders found for this phone number.</p>
                            ) : (
                                <div className="space-y-3">
                                    {customerOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className={`bg-white/10 rounded-xl p-4 border-2 ${order.status === 'ready' ? 'border-green-500 animate-pulse' :
                                                order.status === 'preparing' ? 'border-blue-500' :
                                                    order.status === 'pending' ? 'border-yellow-500' :
                                                        'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-2xl font-black text-white">
                                                    #{getShortOrderNumber(order.order_number)}
                                                </span>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            {order.items && order.items.length > 0 && (
                                                <div className="text-sm text-amber-200/80 mb-2">
                                                    {order.items.map((item, i) => (
                                                        <span key={i}>
                                                            {item.quantity}x {item.name}
                                                            {i < order.items!.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {order.total_usd && (
                                                <p className="text-amber-400 font-bold">${parseFloat(String(order.total_usd)).toFixed(2)}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Telegram tip */}
                    <div className="mt-6 bg-blue-500/20 rounded-xl p-4 border border-blue-400/30">
                        <div className="flex items-start gap-3">
                            <FiSend className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                                <p className="text-white font-medium">Get notifications on Telegram!</p>
                                <p className="text-blue-200 text-sm mt-1">
                                    Message our bot with your phone number to receive alerts when your order is ready.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue Display */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Preparing Column */}
                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FiClock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Preparing</h2>
                                <p className="text-orange-200 text-sm">{preparingOrders.length} orders in queue</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {preparingOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiCoffee className="w-16 h-16 mx-auto text-white/30 mb-4" />
                                    <p className="text-white/60 text-lg">No orders preparing</p>
                                </div>
                            ) : (
                                preparingOrders.map((order, idx) => (
                                    <div
                                        key={order.id}
                                        className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between ${idx === 0 ? 'ring-2 ring-white/50 animate-pulse' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl font-black text-white">
                                                #{getShortOrderNumber(order.order_number)}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'pending'
                                                ? 'bg-yellow-400 text-yellow-900'
                                                : 'bg-white/20 text-white'
                                                }`}>
                                                {order.status === 'pending' ? 'Queued' : 'Making'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Ready Column */}
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FiCheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Ready for Pickup!</h2>
                                <p className="text-green-200 text-sm">{readyOrders.length} orders ready</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {readyOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiCheckCircle className="w-16 h-16 mx-auto text-white/30 mb-4" />
                                    <p className="text-white/60 text-lg">No orders ready yet</p>
                                </div>
                            ) : (
                                readyOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between animate-pulse"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl font-black text-white">
                                                #{getShortOrderNumber(order.order_number)}
                                            </span>
                                        </div>
                                        <span className="px-4 py-2 bg-white text-green-700 rounded-full text-sm font-bold">
                                            🎉 READY!
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div className="text-center mt-12">
                    <p className="text-amber-300/60 text-lg">
                        Please wait for your order number to appear in the <span className="text-green-400 font-bold">Ready</span> column
                    </p>
                    <p className="text-amber-300/40 text-sm mt-2">
                        This screen updates automatically every 3 seconds
                    </p>
                </div>
            </main>

        </div>
    );
}
