'use client';

import { useState } from 'react';
import axios from 'axios';
import { FiSearch, FiShield, FiCheckCircle, FiXCircle, FiLoader, FiCalendar, FiSmartphone } from 'react-icons/fi';

const API_URL = '/api';

export const WarrantyCheck = () => {
    const [imei, setImei] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imei) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.get(`${API_URL}/public/warranty/check/${imei}`);
            setResult(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Verification failed. Please check your IMEI/Serial.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="warranty" className="py-24 bg-gray-50 dark:bg-gray-800/20">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        {/* Left: Form */}
                        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-2xl mb-6">
                                <FiShield className="text-primary-600 w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Warranty Check</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                                Enter your device IMEI or Serial factor to verify warranty coverage instantly.
                            </p>

                            <form onSubmit={handleCheck} className="space-y-4">
                                <div className="relative">
                                    <FiSmartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter IMEI / Serial..."
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-bold tracking-widest placeholder:font-medium placeholder:tracking-normal"
                                        value={imei}
                                        onChange={(e) => setImei(e.target.value)}
                                    />
                                </div>
                                <button
                                    disabled={loading || !imei}
                                    className="w-full btn btn-primary py-4 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 disabled:opacity-50"
                                >
                                    {loading ? <FiLoader className="animate-spin w-5 h-5 mx-auto" /> : 'Verify Status'}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
                                    <FiXCircle className="flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Right: Result */}
                        <div className="p-8 md:p-12 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col justify-center">
                            {result ? (
                                <div className="animate-fadeIn">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${result.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        <FiCheckCircle />
                                        {result.status}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{result.product}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">SN: {result.serial_number}</p>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400">
                                                <FiCalendar />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Coverage Start</p>
                                                <p className="font-bold text-gray-700 dark:text-gray-200">{result.start_date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-400">
                                                <FiCalendar />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiration Date</p>
                                                <p className="font-bold text-gray-700 dark:text-gray-200">{result.end_date}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {result.isValid
                                                ? 'Your device is fully covered by our official warranty program.'
                                                : 'This warranty record has expired or is no longer active.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                                        <FiShield className="text-gray-200 dark:text-gray-700 w-10 h-10" />
                                    </div>
                                    <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-xs">
                                        Awaiting Verification
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
