'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiCoffee, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiDollarSign, FiClock, FiLoader, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

interface ReportData {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        avgOrderValue: number;
        yesterdayRevenue: number;
        revenueChange: number;
    };
    topItems: Array<{ name: string; quantity: number; revenue: number }>;
    categorySales: Array<{ name: string; revenue: number; count: number }>;
    hourlyData: Array<{ hour: number; revenue: number }>;
    dailyData: Array<{ date: string; revenue: number }>;
    paymentMethods: Record<string, number>;
}

const formatPrice = (value: any): string => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
};

// Modern color palette
const CHART_COLORS = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
    '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#ef4444'
];

const GRADIENT_ID = 'colorRevenue';

export default function CafeReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('today');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/cafe/reports?period=${period}`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    // Get best hour safely
    const getBestHour = () => {
        if (!data?.hourlyData || data.hourlyData.length === 0) return null;
        const withRevenue = data.hourlyData.filter(h => h.revenue > 0);
        if (withRevenue.length === 0) return null;
        const best = withRevenue.reduce((max, h) => h.revenue > max.revenue ? h : max, withRevenue[0]);
        return best.hour;
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    // Prepare pie chart data
    const pieData = data?.categorySales?.map((cat, i) => ({
        name: cat.name,
        value: cat.revenue,
        count: cat.count,
        color: CHART_COLORS[i % CHART_COLORS.length]
    })) || [];

    // Prepare hourly data with formatted labels
    const hourlyChartData = data?.hourlyData?.map(h => ({
        hour: `${h.hour}:00`,
        revenue: h.revenue,
        label: h.hour >= 12 ? `${h.hour === 12 ? 12 : h.hour - 12} PM` : `${h.hour === 0 ? 12 : h.hour} AM`
    })) || [];

    // Payment methods data for bar chart
    const paymentData = data?.paymentMethods
        ? Object.entries(data.paymentMethods).map(([method, amount]) => ({
            method: method.charAt(0).toUpperCase() + method.slice(1),
            amount
        }))
        : [];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-amber-500 font-bold">${formatPrice(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
                    <p className="text-amber-500 font-bold">${formatPrice(data.value)}</p>
                    <p className="text-gray-500 text-sm">{data.count} items sold</p>
                </div>
            );
        }
        return null;
    };

    const bestHour = getBestHour();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiPieChart className="text-amber-500" />
                        Café Reports
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Analytics and insights for your café</p>
                </div>
                <div className="flex gap-2">
                    {['today', 'week', 'month'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${period === p
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                            <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        {data?.summary.revenueChange !== undefined && (
                            <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${Number(data.summary.revenueChange) >= 0
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                                }`}>
                                {Number(data.summary.revenueChange) >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                {Math.abs(Number(data.summary.revenueChange))}%
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        ${formatPrice(data?.summary.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Yesterday: ${formatPrice(data?.summary.yesterdayRevenue || 0)}
                    </p>
                </div>

                <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                            <FiShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {data?.summary.totalOrders || 0}
                    </p>
                </div>

                <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center">
                            <FiCoffee className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Avg Order Value</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        ${formatPrice(data?.summary.avgOrderValue || 0)}
                    </p>
                </div>

                <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-100 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                            <FiClock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Peak Hour</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                        {bestHour !== null
                            ? `${bestHour > 12 ? bestHour - 12 : bestHour}:00 ${bestHour >= 12 ? 'PM' : 'AM'}`
                            : '—'
                        }
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Items */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiBarChart2 className="text-amber-500" />
                        Top Selling Items
                    </h3>
                    {data?.topItems && data.topItems.length > 0 ? (
                        <div className="space-y-3">
                            {data.topItems.slice(0, 8).map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</span>
                                            <span className="text-sm text-gray-500">{item.quantity} sold</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(item.quantity / (data.topItems[0]?.quantity || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-green-600 min-w-[60px] text-right">${formatPrice(item.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <FiCoffee className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>No sales data available</p>
                        </div>
                    )}
                </div>

                {/* Sales by Category - Modern Donut Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiPieChart className="text-amber-500" />
                        Sales by Category
                    </h3>
                    {pieData.length > 0 ? (
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            <div className="w-64 h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    style={{
                                                        filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                                                    }}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 grid grid-cols-1 gap-2 w-full">
                                {pieData.map((cat, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <div
                                            className="w-4 h-4 rounded-full shadow-sm"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{cat.name}</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">${formatPrice(cat.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <FiPieChart className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>No category data available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hourly Sales Chart - Modern Area Chart */}
            {period === 'today' && hourlyChartData.length > 0 && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiClock className="text-amber-500" />
                        Sales by Hour
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill={`url(#${GRADIENT_ID})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Payment Methods - Modern Bar Chart */}
            {paymentData.length > 0 && paymentData.some(p => p.amount > 0) && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiDollarSign className="text-amber-500" />
                        Payment Methods
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {paymentData.map((item, i) => (
                            <div
                                key={i}
                                className="text-center p-4 rounded-xl transition-all hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${CHART_COLORS[i]}15, ${CHART_COLORS[i]}05)`,
                                    border: `1px solid ${CHART_COLORS[i]}30`
                                }}
                            >
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">${formatPrice(item.amount)}</p>
                                <p className="text-sm font-medium" style={{ color: CHART_COLORS[i] }}>{item.method}</p>
                            </div>
                        ))}
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="method"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                                    {paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
