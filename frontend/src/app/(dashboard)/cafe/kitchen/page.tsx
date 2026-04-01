'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiCoffee, FiClock, FiCheck, FiLoader, FiVolume2, FiVolumeX, FiRefreshCw, FiWifi, FiWifiOff } from 'react-icons/fi';

interface OrderItem {
    name: string;
    size: string;
    quantity: number;
    customizations?: { sugar?: string; ice?: string };
}

interface KitchenOrder {
    id: string;
    order_number: string;
    status: string;
    createdAt: string;
    order_type?: string;
    table_number?: number;
    items: OrderItem[];
}

export default function KitchenDisplayPage() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [connected, setConnected] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const prevCountRef = useRef(0);
    const eventSourceRef = useRef<EventSource | null>(null);
    const soundRef = useRef(soundEnabled);
    soundRef.current = soundEnabled;

    // Clock (tick every 10s to reduce re-renders)
    useEffect(() => {
        const tick = setInterval(() => setCurrentTime(new Date()), 10000);
        return () => clearInterval(tick);
    }, []);

    const playNotification = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
            // Second beep
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 660;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.3, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                osc2.start(ctx.currentTime);
                osc2.stop(ctx.currentTime + 0.3);
            }, 300);
        } catch { }
    }, []);

    const sseRetryRef = useRef<NodeJS.Timeout | null>(null);
    const connectSSE = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        if (sseRetryRef.current) {
            clearTimeout(sseRetryRef.current);
            sseRetryRef.current = null;
        }

        try {
            const es = new EventSource('/api/sse/orders?status=pending,preparing,ready');
            eventSourceRef.current = es;

            es.onopen = () => {
                setConnected(true);
                setLoading(false);
            };

            es.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'orders') {
                        const newOrders: KitchenOrder[] = msg.data;
                        const newPending = newOrders.filter(o => o.status === 'pending').length;
                        if (soundRef.current && newPending > prevCountRef.current && prevCountRef.current >= 0) {
                            playNotification();
                            if (newPending > prevCountRef.current) {
                                toast(`🔔 New order arrived!`, { icon: '☕', duration: 3000 });
                            }
                        }
                        prevCountRef.current = newPending;
                        setOrders(newOrders);
                        setLoading(false);
                        setConnected(true);
                    }
                } catch { }
            };

            es.onerror = () => {
                setConnected(false);
                es.close();
                eventSourceRef.current = null;
                // Reconnect after 10s to avoid blocking navigation
                sseRetryRef.current = setTimeout(connectSSE, 10000);
            };
        } catch {
            console.warn('[SSE kitchen] Failed to connect');
        }
    }, [playNotification]);

    useEffect(() => {
        const timer = setTimeout(connectSSE, 500);
        return () => {
            clearTimeout(timer);
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
            if (sseRetryRef.current) {
                clearTimeout(sseRetryRef.current);
                sseRetryRef.current = null;
            }
        };
    }, [connectSSE]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            // Use query param ?id= to avoid Vercel monorepo dynamic-segment routing issues
            const res = await fetch(`/api/cafe/orders?id=${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            // Guard against HTML error pages
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                throw new Error(`Server error (${res.status})`);
            }
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success(`Order marked as ${newStatus}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update order');
        }
    };

    const getTimeSince = (dateStr: string) => {
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 min ago';
        if (diffMins < 60) return `${diffMins} mins ago`;
        return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`;
    };

    const getOrderTimeMins = (dateStr: string) =>
        Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);

    const getBorderColor = (status: string, timeMins: number) => {
        if (status === 'ready') return 'border-emerald-500 shadow-emerald-500/20';
        if (status === 'preparing') return 'border-blue-500 shadow-blue-500/20';
        if (timeMins > 10) return 'border-red-500 shadow-red-500/20 animate-pulse';
        if (timeMins > 5) return 'border-yellow-400 shadow-yellow-400/20';
        return 'border-amber-500 shadow-amber-500/10';
    };

    const getBgColor = (status: string, timeMins: number) => {
        if (status === 'ready') return 'bg-emerald-950';
        if (status === 'preparing') return 'bg-blue-950';
        if (timeMins > 10) return 'bg-red-950';
        if (timeMins > 5) return 'bg-yellow-950';
        return 'bg-gray-900';
    };

    const pendingOrders = orders.filter(o => o.status === 'pending');
    const preparingOrders = orders.filter(o => o.status === 'preparing');
    const readyOrders = orders.filter(o => o.status === 'ready');

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-950">
                <div className="text-center">
                    <FiLoader className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-400">Connecting to kitchen stream...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Header Bar */}
            <div className="sticky top-0 z-10 bg-gray-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                        <FiCoffee className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight">Kitchen Display</h1>
                        <div className="flex items-center gap-1.5">
                            {connected
                                ? <><FiWifi className="w-3 h-3 text-emerald-400" /><span className="text-xs text-emerald-400">Live</span></>
                                : <><FiWifiOff className="w-3 h-3 text-red-400" /><span className="text-xs text-red-400">Reconnecting...</span></>
                            }
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-4">
                    <StatBadge count={pendingOrders.length} label="New" color="bg-amber-500" />
                    <StatBadge count={preparingOrders.length} label="Preparing" color="bg-blue-500" />
                    <StatBadge count={readyOrders.length} label="Ready" color="bg-emerald-500" />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSoundEnabled(v => !v)}
                        className={`p-2.5 rounded-xl transition ${soundEnabled ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                        title={soundEnabled ? 'Mute alerts' : 'Enable alerts'}
                    >
                        {soundEnabled ? <FiVolume2 className="w-5 h-5" /> : <FiVolumeX className="w-5 h-5" />}
                    </button>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-gray-500">Current Time</p>
                        <p className="text-sm font-mono font-bold text-amber-400">
                            {currentTime.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Mobile stats */}
            <div className="md:hidden grid grid-cols-3 gap-2 p-3 bg-gray-900 border-b border-white/5">
                <StatBadge count={pendingOrders.length} label="New" color="bg-amber-500" full />
                <StatBadge count={preparingOrders.length} label="Preparing" color="bg-blue-500" full />
                <StatBadge count={readyOrders.length} label="Ready" color="bg-emerald-500" full />
            </div>

            {/* Orders */}
            <div className="p-4">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-gray-600">
                        <FiCoffee className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-xl font-medium">No active orders</p>
                        <p className="text-sm mt-1 opacity-60">New orders will appear here in real-time</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map(order => {
                            const timeMins = getOrderTimeMins(order.createdAt);
                            return (
                                <div
                                    key={order.id}
                                    className={`rounded-2xl border-2 shadow-xl overflow-hidden transition-all duration-300 ${getBorderColor(order.status, timeMins)} ${getBgColor(order.status, timeMins)}`}
                                >
                                    {/* Order Header */}
                                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-black text-white">
                                                #{order.order_number?.split('-').pop()}
                                            </span>
                                            {order.order_type === 'dine_in' && order.table_number && (
                                                <span className="ml-2 text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                                                    Table {order.table_number}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <FiClock className={`w-3 h-3 ${timeMins > 5 ? 'text-red-400' : 'text-gray-500'}`} />
                                                <span className={`text-xs font-medium ${timeMins > 10 ? 'text-red-400 font-bold' : timeMins > 5 ? 'text-yellow-400' : 'text-gray-500'}`}>
                                                    {getTimeSince(order.createdAt)}
                                                </span>
                                            </div>
                                            <StatusBadge status={order.status} />
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="p-4 space-y-2">
                                        {order.items?.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                                                <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0">
                                                    {item.quantity}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider">{item.size}</p>
                                                    {item.customizations && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.customizations.sugar && item.customizations.sugar !== 'normal' && (
                                                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full">
                                                                    🍬 {item.customizations.sugar} sugar
                                                                </span>
                                                            )}
                                                            {item.customizations.ice && item.customizations.ice !== 'normal' && (
                                                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">
                                                                    🧊 {item.customizations.ice} ice
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="px-4 pb-4">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'preparing')}
                                                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl transition active:scale-95"
                                            >
                                                🍳 Start Preparing
                                            </button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'ready')}
                                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <FiCheck className="w-5 h-5" />
                                                Ready to Serve
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'completed')}
                                                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition active:scale-95"
                                            >
                                                ✅ Complete & Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBadge({ count, label, color, full }: { count: number; label: string; color: string; full?: boolean }) {
    return (
        <div className={`flex ${full ? 'flex-col' : 'items-center gap-2'} bg-gray-800 rounded-xl px-3 py-2 ${full ? 'text-center' : ''}`}>
            <span className={`${full ? 'text-2xl' : 'text-xl'} font-black text-white`}>{count}</span>
            <div className={`flex items-center gap-1 ${full ? 'justify-center mt-0.5' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-gray-400 font-medium">{label}</span>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const configs = {
        pending: { label: 'NEW', cls: 'bg-amber-500 text-amber-900' },
        preparing: { label: 'PREPARING', cls: 'bg-blue-500 text-white' },
        ready: { label: 'READY', cls: 'bg-emerald-500 text-white' },
    };
    const conf = configs[status as keyof typeof configs] || { label: status.toUpperCase(), cls: 'bg-gray-600 text-white' };
    return (
        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black ${conf.cls}`}>
            {conf.label}
        </span>
    );
}
