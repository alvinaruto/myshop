'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { reportApi, exchangeRateApi, productApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {
    FiDollarSign, FiShoppingBag, FiTrendingUp, FiUsers, FiAlertCircle,
    FiRefreshCw, FiSmartphone, FiWifi, FiWifiOff, FiCoffee, FiArrowUp, FiArrowDown, FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';
import Link from 'next/link';

interface LiveStats {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    avgOrderValue: number;
    topItems: Array<{ name: string; count: number; revenue: number }>;
    hourlyData: Array<{ hour: string; revenue: number; orders: number }>;
    uniqueCustomers: number;
}

interface DailySummary {
    totalSales: number;
    totalUsd: number;
}

const fmt = (n: number) => n.toFixed(2);

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);

    useEffect(() => {
        const diff = value - prev.current;
        if (diff === 0) return;
        const steps = 20;
        const step = diff / steps;
        let current = prev.current;
        let count = 0;
        const interval = setInterval(() => {
            current += step;
            count++;
            setDisplay(count >= steps ? value : current);
            if (count >= steps) clearInterval(interval);
        }, 20);
        prev.current = value;
        return () => clearInterval(interval);
    }, [value]);

    return <span>{prefix}{typeof display === 'number' ? display.toFixed(2) : display}{suffix}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-800 border border-white/10 rounded-xl p-3 shadow-xl text-sm">
            <p className="text-gray-400 mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="font-bold" style={{ color: p.color }}>{p.name}: {p.name === 'revenue' ? `$${fmt(p.value)}` : p.value}</p>
            ))}
        </div>
    );
};

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [exchangeRate, setExchangeRate] = useState(4100);
    const [newRate, setNewRate] = useState('');
    const [lowStock, setLowStock] = useState<any>({ accessories: [], devices: [] });
    const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
    const [connected, setConnected] = useState(false);
    const [prevRevenue, setPrevRevenue] = useState(0);
    const esRef = useRef<EventSource | null>(null);

    // Load static data (exchange rate, low stock)
    const loadData = async () => {
        setLoading(true);
        try {
            const [dailyRes, rateRes, lowStockRes] = await Promise.all([
                reportApi.getDaily(),
                exchangeRateApi.getToday(),
                productApi.getLowStock(),
            ]);
            setLowStock(lowStockRes.data.data);
            setSummary(dailyRes.data.data.summary);
            const rate = parseFloat(rateRes.data.data.usd_to_khr);
            setExchangeRate(rate);
            setNewRate(rateRes.data.data.usd_to_khr.toString());
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // SSE live analytics
    const sseRetryRef = useRef<NodeJS.Timeout | null>(null);
    const connectSSE = useCallback(() => {
        if (esRef.current) esRef.current.close();
        if (sseRetryRef.current) {
            clearTimeout(sseRetryRef.current);
            sseRetryRef.current = null;
        }

        try {
            const es = new EventSource('/api/sse/analytics');
            esRef.current = es;

            es.onopen = () => setConnected(true);
            es.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    if (msg.type === 'analytics') {
                        setLiveStats(prev => {
                            if (prev) setPrevRevenue(prev.totalRevenue);
                            return msg.data;
                        });
                        setConnected(true);
                    }
                } catch { }
            };
            es.onerror = () => {
                setConnected(false);
                es.close();
                esRef.current = null;
                sseRetryRef.current = setTimeout(connectSSE, 10000);
            };
        } catch {
            console.warn('[SSE analytics] Failed to connect');
        }
    }, []);

    useEffect(() => {
        loadData();
        // Delay SSE so it doesn't block page hydration
        const timer = setTimeout(connectSSE, 1000);
        return () => {
            clearTimeout(timer);
            esRef.current?.close();
            esRef.current = null;
            if (sseRetryRef.current) {
                clearTimeout(sseRetryRef.current);
                sseRetryRef.current = null;
            }
        };
    }, [connectSSE]);

    const updateExchangeRate = async () => {
        if (!newRate || parseFloat(newRate) <= 0) {
            toast.error('Please enter a valid rate');
            return;
        }
        try {
            await exchangeRateApi.setToday(parseFloat(newRate));
            setExchangeRate(parseFloat(newRate));
            toast.success('Exchange rate updated');
        } catch {
            toast.error('Failed to update rate');
        }
    };

    const revenueUp = liveStats ? liveStats.totalRevenue >= prevRevenue : true;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FiActivity className="text-amber-500" />
                        Live Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                        Welcome back, {user?.full_name}
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${connected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {connected ? <FiWifi className="w-3 h-3" /> : <FiWifiOff className="w-3 h-3" />}
                            {connected ? 'Live' : 'Offline'}
                        </span>
                    </p>
                </div>
                <button onClick={loadData} className="btn btn-outline" disabled={loading}>
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Exchange Rate */}
            <div className="card p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Exchange Rate</h3>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">$1 = ៛{exchangeRate.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} className="input w-32" placeholder="Rate" />
                        <button onClick={updateExchangeRate} className="btn btn-primary">Update Rate</button>
                    </div>
                </div>
            </div>

            {/* Live KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={<FiDollarSign />}
                    label="Today's Revenue"
                    value={liveStats ? `$${fmt(liveStats.totalRevenue)}` : loading ? '...' : `$${fmt(summary?.totalUsd || 0)}`}
                    trend={revenueUp ? 'up' : 'down'}
                    color="from-emerald-500 to-teal-600"
                    live={connected}
                />
                <KpiCard
                    icon={<FiShoppingBag />}
                    label="Completed Orders"
                    value={liveStats ? liveStats.totalOrders : (loading ? '...' : (summary?.totalSales || 0))}
                    color="from-blue-500 to-indigo-600"
                    live={connected}
                />
                <KpiCard
                    icon={<FiCoffee />}
                    label="Pending Orders"
                    value={liveStats ? liveStats.pendingOrders : '—'}
                    color="from-amber-500 to-orange-600"
                    live={connected}
                    pulse={!!(liveStats && liveStats.pendingOrders > 0)}
                />
                <KpiCard
                    icon={<FiUsers />}
                    label="Unique Customers"
                    value={liveStats ? liveStats.uniqueCustomers : '—'}
                    color="from-purple-500 to-pink-600"
                    live={connected}
                />
            </div>

            {/* Charts Row */}
            {liveStats && liveStats.hourlyData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Hourly Revenue Area Chart */}
                    <div className="card p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiTrendingUp className="text-amber-500" />
                                Revenue (Last 12 Hours)
                            </h3>
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">Live</span>
                        </div>
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={liveStats.hourlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.4} />
                                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="revenue" name="revenue" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Items */}
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            🏆 Top Items Today
                        </h3>
                        {liveStats.topItems.length === 0 ? (
                            <p className="text-gray-400 text-sm italic text-center py-8">No sales yet today</p>
                        ) : (
                            <div className="space-y-3">
                                {liveStats.topItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-600'}`}>
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                                    style={{ width: `${(item.count / (liveStats.topItems[0]?.count || 1)) * 100}%`, transition: 'width 0.5s ease' }}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">{item.count}x</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hourly Orders Bar Chart */}
            {liveStats && liveStats.hourlyData.some(h => h.orders > 0) && (
                <div className="card p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiShoppingBag className="text-blue-500" />
                        Orders Per Hour
                    </h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={liveStats.hourlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="orders" name="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/pos" className="btn btn-outline py-4 flex flex-col gap-1">
                        <FiShoppingBag className="w-5 h-5" />
                        <span className="text-xs">Open POS</span>
                    </Link>
                    <Link href="/cafe" className="btn btn-outline py-4 flex flex-col gap-1">
                        <FiCoffee className="w-5 h-5" />
                        <span className="text-xs">Café POS</span>
                    </Link>
                    <Link href="/cafe/kitchen" className="btn btn-outline py-4 flex flex-col gap-1">
                        <FiActivity className="w-5 h-5" />
                        <span className="text-xs">Kitchen Display</span>
                    </Link>
                    <Link href="/cafe/reports" className="btn btn-outline py-4 flex flex-col gap-1">
                        <FiTrendingUp className="w-5 h-5" />
                        <span className="text-xs">Reports</span>
                    </Link>
                </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LowStockCard title="Low Stock: Accessories" icon={<FiAlertCircle />} items={lowStock.accessories} valueKey="quantity" borderColor="border-red-500" />
                <LowStockCard title="Low Stock: Devices" icon={<FiSmartphone className="text-orange-500" />} items={lowStock.devices} valueKey="available_stock" borderColor="border-orange-500" />
            </div>
        </div>
    );
}

function KpiCard({ icon, label, value, color, trend, live, pulse }: {
    icon: React.ReactNode;
    label: string;
    value: any;
    color: string;
    trend?: 'up' | 'down';
    live?: boolean;
    pulse?: boolean;
}) {
    return (
        <div className={`card p-5 relative overflow-hidden ${pulse ? 'ring-2 ring-amber-400/50' : ''}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3`}>
                {icon}
            </div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-end gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </p>
                {trend && (
                    <span className={`mb-0.5 ${trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
                        {trend === 'up' ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
                    </span>
                )}
            </div>
            {live && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </div>
    );
}

function LowStockCard({ title, icon, items, valueKey, borderColor }: any) {
    return (
        <div className={`card p-6 border-l-4 ${borderColor}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-bold">
                    {items.length} Items
                </span>
            </div>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">All items are well stocked. ✅</p>
                ) : (
                    items.slice(0, 5).map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.sku || item.brand?.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-red-600">
                                    {item[valueKey]} left
                                </p>
                                <p className="text-xs text-gray-400">Min: {item.low_stock_threshold}</p>
                            </div>
                        </div>
                    ))
                )}
                {items.length > 5 && (
                    <Link href="/inventory" className="block text-center text-sm text-primary-600 font-medium hover:underline">
                        View all {items.length} items
                    </Link>
                )}
            </div>
        </div>
    );
}
