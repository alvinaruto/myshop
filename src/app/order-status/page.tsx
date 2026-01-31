'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCoffee, FiClock, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';

interface QueueOrder {
    id: string;
    order_number: string;
    status: string;
    createdAt: string;
}

export default function PublicOrderStatusPage() {
    const [orders, setOrders] = useState<QueueOrder[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

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

    useEffect(() => {
        fetchOrders();
        const orderInterval = setInterval(fetchOrders, 3000);
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => {
            clearInterval(orderInterval);
            clearInterval(timeInterval);
        };
    }, []);

    const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'pending');
    const readyOrders = orders.filter(o => o.status === 'ready');

    const getShortOrderNumber = (orderNumber: string) => {
        return orderNumber.split('-').pop() || orderNumber;
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
