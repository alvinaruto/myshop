'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPercent, FiClock, FiPackage, FiPlus, FiTrash2, FiLoader, FiTag, FiCalendar } from 'react-icons/fi';

interface HappyHour {
    id: string;
    name: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    start_time: string;
    end_time: string;
    days_of_week: number[];
    applies_to_all: boolean;
    is_active: boolean;
    category?: { name: string };
}

interface Combo {
    id: string;
    name: string;
    name_kh?: string;
    description?: string;
    price: number;
    original_price?: number;
    items: Array<{ menu_item_id: string; size: string; quantity: number }>;
    is_active: boolean;
    image_url?: string;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PromotionsPage() {
    const [activeTab, setActiveTab] = useState<'happyhour' | 'combos'>('happyhour');
    const [happyHours, setHappyHours] = useState<HappyHour[]>([]);
    const [combos, setCombos] = useState<Combo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHappyHourModal, setShowHappyHourModal] = useState(false);
    const [hhForm, setHhForm] = useState({
        name: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '20',
        start_time: '14:00',
        end_time: '16:00',
        days_of_week: [1, 2, 3, 4, 5],
        applies_to_all: true
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hhRes, comboRes] = await Promise.all([
                fetch('/api/cafe/happy-hour'),
                fetch('/api/cafe/combos?all=true')
            ]);
            const hhData = await hhRes.json();
            const comboData = await comboRes.json();

            if (hhData.success) setHappyHours(hhData.data.happyHours || []);
            if (comboData.success) setCombos(comboData.data.combos || []);
        } catch (error) {
            toast.error('Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const createHappyHour = async () => {
        try {
            const res = await fetch('/api/cafe/happy-hour', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...hhForm,
                    discount_value: parseFloat(hhForm.discount_value)
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Happy Hour created!');
                setShowHappyHourModal(false);
                setHhForm({
                    name: '',
                    description: '',
                    discount_type: 'percentage',
                    discount_value: '20',
                    start_time: '14:00',
                    end_time: '16:00',
                    days_of_week: [1, 2, 3, 4, 5],
                    applies_to_all: true
                });
                fetchData();
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create happy hour');
        }
    };

    const deleteHappyHour = async (id: string) => {
        if (!confirm('Delete this happy hour?')) return;
        try {
            const res = await fetch(`/api/cafe/happy-hour?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Happy Hour deleted');
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const deleteCombo = async (id: string) => {
        if (!confirm('Delete this combo?')) return;
        try {
            const res = await fetch(`/api/cafe/combos?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Combo deleted');
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const toggleDay = (day: number) => {
        setHhForm(prev => ({
            ...prev,
            days_of_week: prev.days_of_week.includes(day)
                ? prev.days_of_week.filter(d => d !== day)
                : [...prev.days_of_week, day].sort()
        }));
    };

    const isCurrentlyActive = (hh: HappyHour) => {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.getDay();
        return hh.is_active &&
            hh.days_of_week.includes(currentDay) &&
            currentTime >= hh.start_time &&
            currentTime < hh.end_time;
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
                        <FiTag className="text-amber-500" />
                        Promotions
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage happy hours and combo deals</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('happyhour')}
                    className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'happyhour'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                        }`}
                >
                    <FiClock className="w-5 h-5" />
                    Happy Hours
                </button>
                <button
                    onClick={() => setActiveTab('combos')}
                    className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'combos'
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border'
                        }`}
                >
                    <FiPackage className="w-5 h-5" />
                    Combos
                </button>
            </div>

            {/* Happy Hours Tab */}
            {activeTab === 'happyhour' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowHappyHourModal(true)}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <FiPlus className="w-5 h-5" />
                            Add Happy Hour
                        </button>
                    </div>

                    {happyHours.length === 0 ? (
                        <div className="card p-12 text-center">
                            <FiClock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">No happy hours configured</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {happyHours.map((hh) => (
                                <div
                                    key={hh.id}
                                    className={`card p-4 ${isCurrentlyActive(hh) ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' : ''}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{hh.name}</h3>
                                                {isCurrentlyActive(hh) && (
                                                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full animate-pulse">
                                                        ACTIVE NOW
                                                    </span>
                                                )}
                                            </div>
                                            {hh.description && (
                                                <p className="text-sm text-gray-500 mt-1">{hh.description}</p>
                                            )}

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                                <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                                                    <FiPercent className="w-4 h-4 text-amber-600" />
                                                    <span className="font-medium">
                                                        {hh.discount_type === 'percentage'
                                                            ? `${hh.discount_value}% off`
                                                            : `$${hh.discount_value} off`
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <FiClock className="w-4 h-4" />
                                                    {hh.start_time} - {hh.end_time}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[0, 1, 2, 3, 4, 5, 6].map(day => (
                                                        <span
                                                            key={day}
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${hh.days_of_week.includes(day)
                                                                    ? 'bg-amber-500 text-white'
                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                                                }`}
                                                        >
                                                            {dayNames[day][0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {hh.applies_to_all && (
                                                <p className="text-xs text-gray-400 mt-2">Applies to all items</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => deleteHappyHour(hh.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Combos Tab */}
            {activeTab === 'combos' && (
                <div className="space-y-4">
                    {combos.length === 0 ? (
                        <div className="card p-12 text-center">
                            <FiPackage className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-4">No combos configured</p>
                            <p className="text-sm text-gray-400">Create combos via the API</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {combos.map((combo) => (
                                <div key={combo.id} className="card overflow-hidden">
                                    {combo.image_url && (
                                        <img
                                            src={combo.image_url}
                                            alt={combo.name}
                                            className="w-full h-32 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">{combo.name}</h3>
                                                {combo.name_kh && (
                                                    <p className="text-sm text-gray-500">{combo.name_kh}</p>
                                                )}
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${combo.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {combo.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {combo.description && (
                                            <p className="text-sm text-gray-500 mt-2">{combo.description}</p>
                                        )}

                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="text-xl font-bold text-green-600">${combo.price}</span>
                                            {combo.original_price && combo.original_price > combo.price && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ${combo.original_price}
                                                </span>
                                            )}
                                            {combo.original_price && combo.original_price > combo.price && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    Save ${(combo.original_price - combo.price).toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex justify-end mt-3">
                                            <button
                                                onClick={() => deleteCombo(combo.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Happy Hour Modal */}
            {showHappyHourModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-auto">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiClock className="text-amber-500" />
                            Create Happy Hour
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={hhForm.name}
                                    onChange={(e) => setHhForm({ ...hhForm, name: e.target.value })}
                                    className="input w-full"
                                    placeholder="Afternoon Special"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    value={hhForm.description}
                                    onChange={(e) => setHhForm({ ...hhForm, description: e.target.value })}
                                    className="input w-full"
                                    placeholder="20% off all drinks 2-4pm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Type</label>
                                    <select
                                        value={hhForm.discount_type}
                                        onChange={(e) => setHhForm({ ...hhForm, discount_type: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        value={hhForm.discount_value}
                                        onChange={(e) => setHhForm({ ...hhForm, discount_value: e.target.value })}
                                        className="input w-full"
                                        placeholder="20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={hhForm.start_time}
                                        onChange={(e) => setHhForm({ ...hhForm, start_time: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={hhForm.end_time}
                                        onChange={(e) => setHhForm({ ...hhForm, end_time: e.target.value })}
                                        className="input w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Active Days</label>
                                <div className="flex gap-2">
                                    {dayNames.map((name, day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`w-10 h-10 rounded-full font-medium transition ${hhForm.days_of_week.includes(day)
                                                    ? 'bg-amber-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                                }`}
                                        >
                                            {name[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="applies_to_all"
                                    checked={hhForm.applies_to_all}
                                    onChange={(e) => setHhForm({ ...hhForm, applies_to_all: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="applies_to_all" className="text-sm">
                                    Apply to all menu items
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowHappyHourModal(false)}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createHappyHour}
                                className="flex-1 btn btn-primary"
                            >
                                Create Happy Hour
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
