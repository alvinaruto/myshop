'use client';

import { useState, useEffect } from 'react';
import { FiCoffee, FiClock, FiCheckCircle } from 'react-icons/fi';

interface QueueOrder {
    id: string;
    order_number: string;
    status: string;
    createdAt: string;
}

export default function CafeQueuePage() {
    const [orders, setOrders] = useState<QueueOrder[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/cafe/orders?status=pending,preparing,ready&limit=20');
            const data = await res.json();
            if (data.success) {
                // Handle both array and object response formats
                const ordersData = Array.isArray(data.data) ? data.data : (data.data?.orders || data.data || []);
                setOrders(ordersData);
            }
        } catch (error) {
            console.error('Failed to fetch orders');
        }
    };

    useEffect(() => {
        fetchOrders();
        // Refresh every 3 seconds
        const orderInterval = setInterval(fetchOrders, 3000);
        // Update time every second
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            clearInterval(orderInterval);
            clearInterval(timeInterval);
        };
    }, []);

    // Pending and preparing orders go to "Preparing" column
    const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'pending');
    const readyOrders = orders.filter(o => o.status === 'ready');

    const getShortOrderNumber = (orderNumber: string) => {
        return orderNumber.split('-').pop() || orderNumber;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 text-white overflow-hidden">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                        <FiCoffee className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">MARA LAVIN CAFÉ</h1>
                        <p className="text-amber-300 text-sm">មារ៉ា ឡាវីន កាហ្វេ</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-mono font-bold">
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-amber-300">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8 grid grid-cols-2 gap-8 h-[calc(100vh-100px)]">
                {/* Preparing Column */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FiClock className="w-8 h-8 text-yellow-400" />
                        <h2 className="text-3xl font-bold">Preparing</h2>
                        <span className="text-2xl text-yellow-400 font-bold">កំពុងរៀបចំ</span>
                    </div>

                    {preparingOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FiCoffee className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-xl">No orders preparing</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {preparingOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-6 text-center animate-pulse"
                                >
                                    <p className="text-5xl font-bold text-yellow-400">
                                        {getShortOrderNumber(order.order_number)}
                                    </p>
                                    <p className="text-sm text-yellow-300 mt-2 flex items-center justify-center gap-1">
                                        <FiClock className="w-4 h-4" />
                                        Preparing...
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ready Column */}
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <FiCheckCircle className="w-8 h-8 text-green-400" />
                        <h2 className="text-3xl font-bold">Ready for Pickup</h2>
                        <span className="text-2xl text-green-400 font-bold">រួចរាល់</span>
                    </div>

                    {readyOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <FiCheckCircle className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-xl">No orders ready</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {readyOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-green-500/20 border-4 border-green-500 rounded-xl p-6 text-center relative overflow-hidden"
                                >
                                    {/* Animated glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/30 to-transparent animate-shimmer"></div>
                                    <p className="text-6xl font-bold text-green-400 relative">
                                        {getShortOrderNumber(order.order_number)}
                                    </p>
                                    <p className="text-lg text-green-300 mt-2 font-bold relative flex items-center justify-center gap-2">
                                        <FiCheckCircle className="w-5 h-5" />
                                        READY!
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Banner */}
            <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm py-3 px-6">
                <div className="flex items-center justify-center gap-8 text-amber-300 text-lg">
                    <span>☕ Fresh Coffee</span>
                    <span>•</span>
                    <span>🥐 Pastries</span>
                    <span>•</span>
                    <span>🍵 Tea & More</span>
                    <span>•</span>
                    <span>Free WiFi Available</span>
                </div>
            </div>

            {/* Custom animation styles */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
