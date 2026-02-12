'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiClock, FiDollarSign, FiPlay, FiStopCircle, FiLoader, FiUser, FiCalendar, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';

interface Shift {
    id: string;
    cashier_id: string;
    start_time: string;
    end_time?: string;
    opening_cash_usd: number;
    opening_cash_khr: number;
    closing_cash_usd?: number;
    closing_cash_khr?: number;
    expected_cash_usd?: number;
    discrepancy_usd?: number;
    total_sales_usd: number;
    total_orders: number;
    status: 'open' | 'closed';
    notes?: string;
    cashier?: { full_name: string };
}

const formatPrice = (value: any): string => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
};

export default function ShiftManagementPage() {
    const { user } = useAuthStore();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [currentShift, setCurrentShift] = useState<Shift | null>(null);
    const [loading, setLoading] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [openingCash, setOpeningCash] = useState({ usd: '', khr: '' });
    const [closingCash, setClosingCash] = useState({ usd: '', khr: '' });
    const [closingNotes, setClosingNotes] = useState('');

    const fetchShifts = async () => {
        try {
            const res = await fetch('/api/cafe/shifts');
            const data = await res.json();
            if (data.success) {
                setShifts(data.data.shifts || []);
                // Check for current user's open shift
                const openShift = data.data.shifts?.find(
                    (s: Shift) => s.cashier_id === user?.id && s.status === 'open'
                );
                setCurrentShift(openShift || null);
            }
        } catch (error) {
            toast.error('Failed to load shifts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchShifts();
    }, [user]);

    const startShift = async () => {
        try {
            const res = await fetch('/api/cafe/shifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cashier_id: user?.id,
                    opening_cash_usd: parseFloat(openingCash.usd) || 0,
                    opening_cash_khr: parseFloat(openingCash.khr) || 0
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Shift started!');
                setShowStartModal(false);
                setOpeningCash({ usd: '', khr: '' });
                fetchShifts();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to start shift');
        }
    };

    const endShift = async () => {
        if (!currentShift) return;

        try {
            const res = await fetch('/api/cafe/shifts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shift_id: currentShift.id,
                    closing_cash_usd: parseFloat(closingCash.usd) || 0,
                    closing_cash_khr: parseFloat(closingCash.khr) || 0,
                    notes: closingNotes
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Shift ended successfully!');
                setShowEndModal(false);
                setClosingCash({ usd: '', khr: '' });
                setClosingNotes('');
                fetchShifts();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to end shift');
        }
    };

    const getDuration = (start: string, end?: string) => {
        const startTime = new Date(start);
        const endTime = end ? new Date(end) : new Date();
        const diffMs = endTime.getTime() - startTime.getTime();
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}h ${mins}m`;
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiClock className="text-amber-500" />
                        Shift Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your shifts and cash reconciliation</p>
                </div>
            </div>

            {/* Current Shift Card */}
            <div className="card p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Current Shift</h2>

                {currentShift ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <FiPlay className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-green-600">Shift Active</p>
                                <p className="text-sm text-gray-500">
                                    Started: {new Date(currentShift.start_time).toLocaleString()}
                                </p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {getDuration(currentShift.start_time)}
                                </p>
                                <p className="text-sm text-gray-500">Duration</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                            <div>
                                <p className="text-sm text-gray-500">Opening Cash (USD)</p>
                                <p className="text-xl font-bold">${formatPrice(currentShift.opening_cash_usd)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Opening Cash (KHR)</p>
                                <p className="text-xl font-bold">៛{parseInt(currentShift.opening_cash_khr?.toString() || '0').toLocaleString()}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowEndModal(true)}
                            className="w-full btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
                        >
                            <FiStopCircle className="w-5 h-5" />
                            End Shift
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiClock className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-4">No active shift</p>
                        <button
                            onClick={() => setShowStartModal(true)}
                            className="btn btn-primary flex items-center gap-2 mx-auto"
                        >
                            <FiPlay className="w-5 h-5" />
                            Start Shift
                        </button>
                    </div>
                )}
            </div>

            {/* Recent Shifts */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Shifts</h2>
                </div>

                {shifts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FiCalendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No shift history</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discrepancy</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {shifts.map((shift) => (
                                    <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-4 py-3 text-sm">
                                            <div>{new Date(shift.start_time).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {shift.end_time && ` - ${new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FiUser className="w-4 h-4 text-gray-400" />
                                                {shift.cashier?.full_name || '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {getDuration(shift.start_time, shift.end_time)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">
                                            {shift.total_orders}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-green-600">
                                            ${formatPrice(shift.total_sales_usd)}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {shift.discrepancy_usd !== null && shift.discrepancy_usd !== undefined ? (
                                                <span className={`flex items-center gap-1 ${parseFloat(shift.discrepancy_usd.toString()) === 0 ? 'text-green-600' :
                                                        parseFloat(shift.discrepancy_usd.toString()) > 0 ? 'text-blue-600' : 'text-red-600'
                                                    }`}>
                                                    {parseFloat(shift.discrepancy_usd.toString()) === 0 ? (
                                                        <FiCheck className="w-4 h-4" />
                                                    ) : (
                                                        <FiAlertTriangle className="w-4 h-4" />
                                                    )}
                                                    ${formatPrice(shift.discrepancy_usd)}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${shift.status === 'open'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {shift.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Start Shift Modal */}
            {showStartModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiPlay className="text-green-500" />
                            Start New Shift
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Enter the opening cash drawer amounts:</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Opening Cash (USD)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={openingCash.usd}
                                        onChange={(e) => setOpeningCash({ ...openingCash, usd: e.target.value })}
                                        className="input pl-8 w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Opening Cash (KHR)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">៛</span>
                                    <input
                                        type="number"
                                        value={openingCash.khr}
                                        onChange={(e) => setOpeningCash({ ...openingCash, khr: e.target.value })}
                                        className="input pl-8 w-full"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowStartModal(false)}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startShift}
                                className="flex-1 btn btn-primary"
                            >
                                Start Shift
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* End Shift Modal */}
            {showEndModal && currentShift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiStopCircle className="text-red-500" />
                            End Shift
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Count your cash drawer and enter the closing amounts:</p>

                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                <p className="text-sm text-gray-500">Shift Duration</p>
                                <p className="font-bold">{getDuration(currentShift.start_time)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Closing Cash (USD) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={closingCash.usd}
                                        onChange={(e) => setClosingCash({ ...closingCash, usd: e.target.value })}
                                        className="input pl-8 w-full"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Closing Cash (KHR)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">៛</span>
                                    <input
                                        type="number"
                                        value={closingCash.khr}
                                        onChange={(e) => setClosingCash({ ...closingCash, khr: e.target.value })}
                                        className="input pl-8 w-full"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes (optional)
                                </label>
                                <textarea
                                    value={closingNotes}
                                    onChange={(e) => setClosingNotes(e.target.value)}
                                    className="input w-full h-20"
                                    placeholder="Any notes about the shift..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowEndModal(false)}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={endShift}
                                className="flex-1 btn bg-red-500 text-white hover:bg-red-600"
                            >
                                End Shift
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
