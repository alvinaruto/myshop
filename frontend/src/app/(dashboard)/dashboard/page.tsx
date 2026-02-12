'use client';

import { useEffect, useState } from 'react';
import { reportApi, exchangeRateApi, productApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiUsers, FiAlertCircle, FiRefreshCw, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface DailySummary {
    date: string;
    totalSales: number;
    totalUsd: number;
    totalPaidUsd: number;
    totalPaidKhr: number;
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<DailySummary | null>(null);
    const [exchangeRate, setExchangeRate] = useState<number>(4100);
    const [newRate, setNewRate] = useState<string>('');
    const [lowStock, setLowStock] = useState<any>({ accessories: [], devices: [] });

    useEffect(() => {
        loadData();
    }, []);

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
            setExchangeRate(parseFloat(rateRes.data.data.usd_to_khr));
            setNewRate(rateRes.data.data.usd_to_khr.toString());
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const updateExchangeRate = async () => {
        if (!newRate || parseFloat(newRate) <= 0) {
            toast.error('Please enter a valid rate');
            return;
        }

        try {
            await exchangeRateApi.setToday(parseFloat(newRate));
            setExchangeRate(parseFloat(newRate));
            toast.success('Exchange rate updated');
        } catch (error) {
            toast.error('Failed to update rate');
        }
    };

    const stats = [
        {
            label: 'Today\'s Sales',
            value: summary?.totalSales || 0,
            icon: FiShoppingBag,
            color: 'bg-blue-500',
        },
        {
            label: 'Revenue (USD)',
            value: `$${Number(summary?.totalUsd || 0).toFixed(2)}`,
            icon: FiDollarSign,
            color: 'bg-green-500',
        },
        {
            label: 'Paid in USD',
            value: `$${Number(summary?.totalPaidUsd || 0).toFixed(2)}`,
            icon: FiTrendingUp,
            color: 'bg-purple-500',
        },
        {
            label: 'Paid in KHR',
            value: `៛${(summary?.totalPaidKhr || 0).toLocaleString()}`,
            icon: FiUsers,
            color: 'bg-orange-500',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Welcome back, {user?.full_name}
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="btn btn-outline"
                    disabled={loading}
                >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Exchange Rate Card */}
            <div className="card p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Today&apos;s Exchange Rate
                        </h3>
                        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                            $1 = ៛{exchangeRate.toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={newRate}
                            onChange={(e) => setNewRate(e.target.value)}
                            className="input w-32"
                            placeholder="Rate"
                        />
                        <button onClick={updateExchangeRate} className="btn btn-primary">
                            Update Rate
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {loading ? '...' : stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/pos" className="btn btn-outline py-4">
                        <FiShoppingBag className="w-5 h-5" />
                        Open POS
                    </a>
                    <a href="/inventory" className="btn btn-outline py-4">
                        <FiPackage className="w-5 h-5" />
                        Add Product
                    </a>
                    <a href="/reports" className="btn btn-outline py-4">
                        <FiTrendingUp className="w-5 h-5" />
                        View Reports
                    </a>
                    <a href="/sales" className="btn btn-outline py-4">
                        <FiDollarSign className="w-5 h-5" />
                        Sales History
                    </a>
                </div>
            </div>
            {/* Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <FiAlertCircle className="text-red-500" />
                            Low Stock: Accessories
                        </h3>
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                            {lowStock.accessories.length} Items
                        </span>
                    </div>
                    <div className="space-y-3">
                        {lowStock.accessories.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">All accessories are well stocked.</p>
                        ) : (
                            lowStock.accessories.slice(0, 5).map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                    <div>
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-red-600">{item.quantity} left</p>
                                        <p className="text-xs text-gray-400">Min: {item.low_stock_threshold}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {lowStock.accessories.length > 5 && (
                            <a href="/inventory" className="block text-center text-sm text-primary-600 font-medium hover:underline">
                                View all {lowStock.accessories.length} items
                            </a>
                        )}
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <FiSmartphone className="text-orange-500" />
                            Low Stock: Devices
                        </h3>
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">
                            {lowStock.devices.length} Models
                        </span>
                    </div>
                    <div className="space-y-3">
                        {lowStock.devices.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">All devices are well stocked.</p>
                        ) : (
                            lowStock.devices.slice(0, 5).map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                    <div>
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.brand?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-orange-600">{item.available_stock} left</p>
                                        <p className="text-xs text-gray-400">Min: {item.low_stock_threshold}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {lowStock.devices.length > 5 && (
                            <a href="/inventory" className="block text-center text-sm text-primary-600 font-medium hover:underline">
                                View all {lowStock.devices.length} models
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FiPackage(props: any) {
    return (
        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
    );
}
