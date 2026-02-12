'use client';

import { useState, useEffect } from 'react';
import { categoryApi, brandApi, exchangeRateApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [rateHistory, setRateHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('categories');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [catRes, brandRes, rateRes] = await Promise.all([
                categoryApi.getAll(),
                brandApi.getAll(),
                exchangeRateApi.getHistory(30),
            ]);
            setCategories(catRes.data.data);
            setBrands(brandRes.data.data);
            setRateHistory(rateRes.data.data);
        } catch (error) {
            toast.error('Failed to load settings');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
                <p className="text-gray-500">Manage system configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                {['categories', 'brands', 'exchange-rates'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize transition ${activeTab === tab
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {activeTab === 'categories' && <CategoriesTab categories={categories} onRefresh={loadData} />}
            {activeTab === 'brands' && <BrandsTab brands={brands} onRefresh={loadData} />}
            {activeTab === 'exchange-rates' && <ExchangeRatesTab history={rateHistory} />}
        </div>
    );
}

function CategoriesTab({ categories, onRefresh }: { categories: any[]; onRefresh: () => void }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', name_kh: '', is_serialized: false });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await categoryApi.update(editing.id, form);
            } else {
                await categoryApi.create(form);
            }
            toast.success('Category saved');
            setShowModal(false);
            setEditing(null);
            setForm({ name: '', name_kh: '', is_serialized: false });
            onRefresh();
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try {
            await categoryApi.delete(id);
            toast.success('Deleted');
            onRefresh();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="card">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Product Categories</h3>
                <button onClick={() => { setEditing(null); setForm({ name: '', name_kh: '', is_serialized: false }); setShowModal(true); }} className="btn btn-primary btn-sm px-3 py-1 text-sm">
                    <FiPlus className="w-4 h-4" /> Add
                </button>
            </div>
            <div className="divide-y dark:divide-gray-700">
                {categories.map((cat) => (
                    <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{cat.name}</p>
                            {cat.name_kh && <p className="text-sm text-gray-500 dark:text-gray-400 font-khmer">{cat.name_kh}</p>}
                            {cat.is_serialized && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Serialized</span>}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditing(cat); setForm(cat); setShowModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Category</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
                            <input type="text" placeholder="Name (Khmer)" value={form.name_kh} onChange={(e) => setForm({ ...form, name_kh: e.target.value })} className="input font-khmer" />
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.is_serialized} onChange={(e) => setForm({ ...form, is_serialized: e.target.checked })} className="rounded text-primary-600 focus:ring-primary-500" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Track by IMEI/Serial</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BrandsTab({ brands, onRefresh }: { brands: any[]; onRefresh: () => void }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                await brandApi.update(editing.id, { name });
            } else {
                await brandApi.create({ name });
            }
            toast.success('Brand saved');
            setShowModal(false);
            setEditing(null);
            setName('');
            onRefresh();
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this brand?')) return;
        try {
            await brandApi.delete(id);
            toast.success('Deleted');
            onRefresh();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="card">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Brands</h3>
                <button onClick={() => { setEditing(null); setName(''); setShowModal(true); }} className="btn btn-primary btn-sm">
                    <FiPlus className="w-4 h-4" /> Add
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                {brands.map((brand) => (
                    <div key={brand.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{brand.name}</span>
                        <div className="flex gap-1">
                            <button onClick={() => { setEditing(brand); setName(brand.name); setShowModal(true); }} className="p-1 hover:bg-gray-100 rounded"><FiEdit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(brand.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><FiTrash2 className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Brand</h3>
                        <input type="text" placeholder="Brand name" value={name} onChange={(e) => setName(e.target.value)} className="input mb-4" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ExchangeRatesTab({ history }: { history: any[] }) {
    return (
        <div className="card">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Exchange Rate History (Last 30 days)</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rate (KHR/$)</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Set By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {history.map((rate) => (
                            <tr key={rate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{rate.rate_date}</td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-primary-600 dark:text-primary-400">៛{parseFloat(rate.usd_to_khr).toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{rate.setByUser?.full_name || 'System'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
