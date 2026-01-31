'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiCoffee, FiTrendingUp, FiTrendingDown, FiShoppingBag, FiDollarSign, FiClock, FiLoader, FiPieChart, FiBarChart2 } from 'react-icons/fi';

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

const formatPrice = (value: number): string => {
    return value.toFixed(2);
};

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

    const getMaxHourlyRevenue = () => {
        if (!data?.hourlyData) return 100;
        return Math.max(...data.hourlyData.map(h => h.revenue), 1);
    };

    const getMaxCategoryRevenue = () => {
        if (!data?.categorySales) return 100;
        return Math.max(...data.categorySales.map(c => c.revenue), 1);
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const categoryColors = [
        'bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
        'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-red-500'
    ];

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
                                    ? 'bg-amber-500 text-white'
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
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <FiDollarSign className="w-8 h-8 text-green-500" />
                        {data?.summary.revenueChange !== undefined && (
                            <span className={`flex items-center text-sm ${Number(data.summary.revenueChange) >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                {Number(data.summary.revenueChange) >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                {Math.abs(Number(data.summary.revenueChange))}%
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${formatPrice(data?.summary.totalRevenue || 0)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Yesterday: ${formatPrice(data?.summary.yesterdayRevenue || 0)}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <FiShoppingBag className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {data?.summary.totalOrders || 0}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <FiCoffee className="w-8 h-8 text-amber-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${formatPrice(data?.summary.avgOrderValue || 0)}
                    </p>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <FiClock className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Best Hour</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {data?.hourlyData && data.hourlyData.length > 0
                            ? `${data.hourlyData.reduce((max, h) => h.revenue > max.revenue ? h : max, data.hourlyData[0]).hour}:00`
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
                                    <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</span>
                                            <span className="text-sm text-gray-500">{item.quantity} sold</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                                style={{ width: `${(item.quantity / (data.topItems[0]?.quantity || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-green-600">${formatPrice(item.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No sales data available</p>
                    )}
                </div>

                {/* Sales by Category */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiPieChart className="text-amber-500" />
                        Sales by Category
                    </h3>
                    {data?.categorySales && data.categorySales.length > 0 ? (
                        <div className="space-y-4">
                            {/* Simple pie chart visualization */}
                            <div className="flex justify-center mb-4">
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                        {(() => {
                                            const total = data.categorySales.reduce((sum, c) => sum + c.revenue, 0);
                                            let currentAngle = 0;
                                            return data.categorySales.map((cat, i) => {
                                                const percentage = (cat.revenue / total) * 100;
                                                const angle = (percentage / 100) * 360;
                                                const largeArc = angle > 180 ? 1 : 0;
                                                const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                                                const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                                                const endX = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                                                const endY = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                                                const path = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`;
                                                currentAngle += angle;
                                                const colors = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#f97316', '#14b8a6', '#ef4444'];
                                                return <path key={i} d={path} fill={colors[i % colors.length]} />;
                                            });
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="text-sm font-bold">${formatPrice(data.categorySales.reduce((sum, c) => sum + c.revenue, 0))}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-2">
                                {data.categorySales.map((cat, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${categoryColors[i % categoryColors.length]}`}></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{cat.name}</span>
                                        <span className="text-sm font-medium ml-auto">${formatPrice(cat.revenue)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No category data available</p>
                    )}
                </div>
            </div>

            {/* Hourly Sales Chart (for Today) */}
            {period === 'today' && data?.hourlyData && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <FiClock className="text-amber-500" />
                        Sales by Hour
                    </h3>
                    <div className="h-48 flex items-end gap-1">
                        {data.hourlyData.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t transition-all hover:from-amber-600 hover:to-orange-500"
                                    style={{
                                        height: `${Math.max(4, (h.revenue / getMaxHourlyRevenue()) * 100)}%`,
                                        minHeight: h.revenue > 0 ? '8px' : '4px'
                                    }}
                                    title={`${h.hour}:00 - $${formatPrice(h.revenue)}`}
                                />
                                <span className="text-[10px] text-gray-500 mt-1">{h.hour}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Methods */}
            {data?.paymentMethods && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(data.paymentMethods).map(([method, amount]) => (
                            <div key={method} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">${formatPrice(amount)}</p>
                                <p className="text-sm text-gray-500 capitalize">{method}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
