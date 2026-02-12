'use client';

import { useState, useEffect } from 'react';
import { reportApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiDollarSign, FiUsers, FiPackage, FiCalendar } from 'react-icons/fi';

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
    const [profitData, setProfitData] = useState<any>(null);
    const [topSelling, setTopSelling] = useState<any[]>([]);
    const [staffData, setStaffData] = useState<any[]>([]);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [profitRes, topRes, staffRes] = await Promise.all([
                reportApi.getProfit(startDate, endDate),
                reportApi.getTopSelling(30, 10),
                reportApi.getStaffPerformance(startDate, endDate),
            ]);

            setProfitData(profitRes.data.data);
            setTopSelling(topRes.data.data);
            setStaffData(staffRes.data.data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>
                    <p className="text-gray-500">Sales analytics and performance metrics</p>
                </div>
            </div>

            {/* Date Range */}
            <div className="card p-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" />
                    </div>
                    <button onClick={loadReports} className="btn btn-primary">
                        <FiCalendar className="w-4 h-4" />
                        Generate Reports
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading reports...</div>
            ) : (
                <>
                    {/* Profit Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="card p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center">
                                    <FiDollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Revenue</p>
                                    <p className="text-2xl font-bold">${profitData?.totalRevenue || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center">
                                    <FiPackage className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Cost</p>
                                    <p className="text-2xl font-bold">${profitData?.totalCost || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center">
                                    <FiTrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gross Profit</p>
                                    <p className="text-2xl font-bold text-green-600">${profitData?.grossProfit || 0}</p>
                                </div>
                            </div>
                        </div>
                        <div className="card p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center">
                                    <FiTrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{profitData?.profitMargin || 0}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Selling Products */}
                        <div className="card">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold">Top Selling Products (30 days)</h3>
                            </div>
                            <div className="p-4">
                                {topSelling.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No data available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {topSelling.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{item.product?.name}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.product?.brand?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 dark:text-white">{item.total_sold} sold</p>
                                                    <p className="text-sm text-green-600 dark:text-green-400">${parseFloat(item.total_revenue).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Staff Performance */}
                        <div className="card">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold">Staff Performance</h3>
                            </div>
                            <div className="p-4">
                                {staffData.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No data available</p>
                                ) : (
                                    <div className="space-y-3">
                                        {staffData.map((staff, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {staff.cashier?.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{staff.cashier?.full_name || 'Unknown'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 dark:text-white">{staff.total_sales} sales</p>
                                                    <p className="text-sm text-green-600 dark:text-green-400">${parseFloat(staff.total_revenue || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
