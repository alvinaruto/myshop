'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiCoffee, FiClock, FiCheck, FiLoader, FiVolume2, FiVolumeX, FiRefreshCw } from 'react-icons/fi';

interface OrderItem {
    name: string;
    size: string;
    quantity: number;
    customizations?: {
        sugar?: string;
        ice?: string;
    };
}

interface KitchenOrder {
    id: string;
    order_number: string;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

export default function KitchenDisplayPage() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [lastOrderCount, setLastOrderCount] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/cafe/orders?status=pending,preparing,ready&limit=50');
            const data = await res.json();
            if (data.success) {
                // Handle both array and object response formats
                const ordersData = Array.isArray(data.data) ? data.data : (data.data?.orders || data.data || []);

                // Play sound for new orders
                if (soundEnabled && ordersData.length > lastOrderCount && lastOrderCount > 0) {
                    playNotification();
                }
                setLastOrderCount(ordersData.length);
                setOrders(ordersData);
            }
        } catch (error) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const playNotification = () => {
        // Create a beep sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 200);
    };

    useEffect(() => {
        fetchOrders();
        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [soundEnabled]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/cafe/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Order marked as ${newStatus}`);
                fetchOrders();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update order');
        }
    };

    const getTimeSince = (dateStr: string) => {
        const now = new Date();
        const orderTime = new Date(dateStr);
        const diffMs = now.getTime() - orderTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 min ago';
        if (diffMins < 60) return `${diffMins} mins ago`;
        return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`;
    };

    const getStatusColor = (status: string, timeMins: number) => {
        if (status === 'ready') return 'border-green-500 bg-green-50 dark:bg-green-900/20';
        if (timeMins > 10) return 'border-red-500 bg-red-50 dark:bg-red-900/20'; // Late order
        if (timeMins > 5) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'; // Getting late
        return 'border-amber-500 bg-white dark:bg-gray-800';
    };

    const getOrderTimeMins = (dateStr: string) => {
        const now = new Date();
        const orderTime = new Date(dateStr);
        return Math.floor((now.getTime() - orderTime.getTime()) / 60000);
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-900">
                <FiLoader className="w-12 h-12 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <FiCoffee className="w-8 h-8 text-amber-500" />
                    <h1 className="text-2xl font-bold">Kitchen Display</h1>
                    <span className="text-sm text-gray-400">Auto-refresh: 5s</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-3 rounded-lg ${soundEnabled ? 'bg-amber-500' : 'bg-gray-700'}`}
                    >
                        {soundEnabled ? <FiVolume2 className="w-5 h-5" /> : <FiVolumeX className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                        <FiRefreshCw className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Current Time</p>
                        <p className="text-xl font-mono">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400">{pendingOrders.length}</p>
                    <p className="text-sm text-gray-400">New Orders</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400">{preparingOrders.length}</p>
                    <p className="text-sm text-gray-400">Preparing</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{readyOrders.length}</p>
                    <p className="text-sm text-gray-400">Ready</p>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <FiCoffee className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-xl text-gray-500">No active orders</p>
                        <p className="text-sm text-gray-600">New orders will appear here</p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const timeMins = getOrderTimeMins(order.createdAt);
                        return (
                            <div
                                key={order.id}
                                className={`rounded-xl border-4 p-4 transition-all ${getStatusColor(order.status, timeMins)}`}
                            >
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        #{order.order_number.split('-').pop()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <FiClock className={`w-4 h-4 ${timeMins > 5 ? 'text-red-500' : 'text-gray-500'}`} />
                                        <span className={`text-sm ${timeMins > 5 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                            {getTimeSince(order.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-3 ${order.status === 'pending' ? 'bg-yellow-500 text-yellow-900' :
                                    order.status === 'preparing' ? 'bg-blue-500 text-white' :
                                        'bg-green-500 text-white'
                                    }`}>
                                    {order.status}
                                </div>

                                {/* Items */}
                                <div className="space-y-2 mb-4">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="bg-gray-800/50 dark:bg-gray-700/50 rounded-lg p-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                    {item.quantity}
                                                </span>
                                                <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                                <span className="text-xs text-gray-500 uppercase">{item.size}</span>
                                            </div>
                                            {item.customizations && (Object.keys(item.customizations).length > 0) && (
                                                <div className="mt-1 ml-8 text-xs text-gray-500">
                                                    {item.customizations.sugar && item.customizations.sugar !== 'normal' && (
                                                        <span className="mr-2">Sugar: {item.customizations.sugar}</span>
                                                    )}
                                                    {item.customizations.ice && item.customizations.ice !== 'normal' && (
                                                        <span>Ice: {item.customizations.ice}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'preparing')}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                                        >
                                            Start Preparing
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'ready')}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
                                        >
                                            <FiCheck className="w-5 h-5 inline mr-2" />
                                            Ready
                                        </button>
                                    )}
                                    {order.status === 'ready' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'completed')}
                                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
                                        >
                                            Complete & Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
