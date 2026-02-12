'use client';

import { useState } from 'react';
import { serialApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiSearch, FiShield, FiCalendar, FiUser, FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { format, differenceInMonths, isAfter } from 'date-fns';

export default function WarrantyPage() {
    const [imei, setImei] = useState('');
    const [loading, setLoading] = useState(false);
    const [warrantyData, setWarrantyData] = useState<any>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imei) return;

        setLoading(true);
        try {
            const res = await serialApi.checkWarranty(imei);
            setWarrantyData(res.data.data);
            if (!res.data.data) {
                toast.error('No warranty found for this IMEI');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to check warranty');
        } finally {
            setLoading(false);
        }
    };

    const isExpired = warrantyData?.warranty?.end_date && isAfter(new Date(), new Date(warrantyData.warranty.end_date));

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warranty Tracker</h1>
                <p className="text-gray-500">Search and track device warranty by IMEI or Serial Number</p>
            </div>

            {/* Search Box */}
            <div className="card p-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={imei}
                            onChange={(e) => setImei(e.target.value)}
                            placeholder="Enter 15-digit IMEI or Serial Number..."
                            className="input pl-12 text-lg py-4"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !imei}
                        className="btn btn-primary px-8 text-lg"
                    >
                        {loading ? 'Searching...' : 'Check Warranty'}
                    </button>
                </form>
            </div>

            {/* Results */}
            {warrantyData && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Status Card */}
                    <div className={`card overflow-hidden border-l-8 ${isExpired ? 'border-red-500' : 'border-green-500'}`}>
                        <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {isExpired ? <FiAlertCircle className="w-10 h-10" /> : <FiCheckCircle className="w-10 h-10" />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {isExpired ? 'Warranty Expired' : 'Warranty Active'}
                                    </h2>
                                    <p className="text-gray-500 italic">
                                        {warrantyData.serialItem.product.name} ({warrantyData.serialItem.imei})
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {warrantyData.warranty?.status || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Device Info */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FiInfo className="text-primary-600" />
                                Device Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Product Name</span>
                                    <span className="font-medium">{warrantyData.serialItem.product.name}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">SKU</span>
                                    <span className="font-medium">{warrantyData.serialItem.product.sku}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">IMEI</span>
                                    <span className="font-medium font-mono">{warrantyData.serialItem.imei}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Condition</span>
                                    <span className="font-medium capitalize">{warrantyData.serialItem.product.condition}</span>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Details */}
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FiShield className="text-primary-600" />
                                Warranty Details
                            </h3>
                            {warrantyData.warranty ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Start Date</span>
                                        <span className="font-medium">{format(new Date(warrantyData.warranty.start_date), 'PPP')}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">End Date</span>
                                        <span className={`font-bold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                                            {format(new Date(warrantyData.warranty.end_date), 'PPP')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Duration</span>
                                        <span className="font-medium">{warrantyData.warranty.duration_months} Months</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Invoice Reference</span>
                                        <span className="font-medium text-primary-600">#{warrantyData.warranty.sale?.invoice_number || 'N/A'}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No warranty record found for this device.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Terms */}
                    {warrantyData.warranty?.terms && (
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                <FiInfo className="text-primary-600" />
                                Warranty Terms
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line text-sm bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                {warrantyData.warranty.terms}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
