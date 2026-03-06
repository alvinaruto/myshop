'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiAward, FiTrendingUp, FiSearch, FiStar, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Customer {
    id: string;
    phone: string;
    name?: string;
    loyalty_points: number;
    total_spent: number;
    total_orders: number;
    last_visit?: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const TIER_CONFIG = {
    platinum: { label: 'Platinum', emoji: '💎', color: 'from-purple-500 to-purple-800', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
    gold: { label: 'Gold', emoji: '🥇', color: 'from-yellow-400 to-amber-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
    silver: { label: 'Silver', emoji: '🥈', color: 'from-gray-300 to-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' },
    bronze: { label: 'Bronze', emoji: '🥉', color: 'from-amber-600 to-amber-800', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
};

const TIERS = ['platinum', 'gold', 'silver', 'bronze'] as const;

export default function LoyaltyPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterTier, setFilterTier] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.set('search', search);
            const res = await fetch(`/api/cafe/customers?${params}`);
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data.customers);
                setTotal(data.data.total);
            }
        } catch {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(timer);
    }, [search, page]);

    const filteredCustomers = filterTier === 'all'
        ? customers
        : customers.filter(c => c.tier === filterTier);

    // Stats by tier
    const tierStats = TIERS.map(tier => ({
        tier,
        count: customers.filter(c => c.tier === tier).length,
        ...TIER_CONFIG[tier]
    }));

    const topEarner = customers[0];
    const totalPoints = customers.reduce((s, c) => s + (c.loyalty_points || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiAward className="text-amber-500" />
                        Loyalty Program
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Customer loyalty tiers and points overview</p>
                </div>
            </div>

            {/* Tier Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {tierStats.map(stat => (
                    <button
                        key={stat.tier}
                        onClick={() => setFilterTier(filterTier === stat.tier ? 'all' : stat.tier)}
                        className={`card p-5 text-left transition-all border-2 ${filterTier === stat.tier ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-transparent'}`}
                    >
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${stat.bg} ${stat.text}`}>
                            <span>{stat.emoji}</span>
                            {stat.label}
                        </div>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Members</p>
                    </button>
                ))}
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-100 dark:border-amber-800">
                    <FiUsers className="w-8 h-8 text-amber-600 mb-3" />
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">Total Customers</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{total}</p>
                </div>
                <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-100 dark:border-purple-800">
                    <FiStar className="w-8 h-8 text-purple-600 mb-3" />
                    <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">Total Points Issued</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white">{totalPoints.toLocaleString()}</p>
                </div>
                <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800">
                    <FiTrendingUp className="w-8 h-8 text-green-600 mb-3" />
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">Top Earner</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white truncate">
                        {topEarner ? (topEarner.name || topEarner.phone) : '—'}
                    </p>
                    {topEarner && (
                        <p className="text-xs text-gray-500 mt-1">{topEarner.loyalty_points} pts</p>
                    )}
                </div>
            </div>

            {/* Search + Table */}
            <div className="card p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name or phone..."
                            className="input pl-10 w-full"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <FiUsers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No customers found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tier</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Orders</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Spent</th>
                                    <th className="py-3 px-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Last Visit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredCustomers.map((customer, i) => {
                                    const tier = TIER_CONFIG[customer.tier] || TIER_CONFIG.bronze;
                                    const rank = (page - 1) * 20 + i + 1;
                                    return (
                                        <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                            <td className="py-3 px-4">
                                                {rank <= 3 ? (
                                                    <span className="text-xl">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400 font-medium">{rank}</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {customer.name || 'Guest'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{customer.phone}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${tier.bg} ${tier.text}`}>
                                                    {tier.emoji} {tier.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="font-black text-amber-600 dark:text-amber-400">
                                                    {(customer.loyalty_points || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                {customer.total_orders || 0}
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm font-medium text-green-600 dark:text-green-400">
                                                ${parseFloat(String(customer.total_spent || 0)).toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4 text-right text-xs text-gray-500">
                                                {customer.last_visit
                                                    ? new Date(customer.last_visit).toLocaleDateString()
                                                    : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {total > 20 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500">
                            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} customers
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="btn btn-outline py-1.5 px-4 text-sm disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * 20 >= total}
                                className="btn btn-outline py-1.5 px-4 text-sm disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
