'use client';

import { useState, useEffect } from 'react';
import { categoryApi, brandApi, exchangeRateApi, authApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiShield, FiBriefcase, FiLock, FiMail, FiMapPin, FiPhone, FiGlobe, FiInfo, FiDollarSign } from 'react-icons/fi';

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [rateHistory, setRateHistory] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('business');

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
            
            // Load users if admin
            if (user?.role === 'admin' || user?.role === 'manager') {
                const userRes = await userApi.getAll();
                setUsers(userRes.data.data);
            }
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
            <div className="flex gap-2 border-b overflow-x-auto">
                {[
                    { id: 'business', name: 'Shop Profile', icon: FiBriefcase },
                    ...(user?.role === 'admin' || user?.role === 'manager' ? [{ id: 'users', name: 'Staff', icon: FiUser }] : []),
                    { id: 'categories', name: 'Categories', icon: FiPlus },
                    { id: 'brands', name: 'Brands', icon: FiPlus },
                    { id: 'exchange-rates', name: 'Rates', icon: FiDollarSign },
                    { id: 'security', name: 'Account', icon: FiShield },
                    { id: 'integrations', name: 'Proxy', icon: FiGlobe },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 font-medium capitalize transition whitespace-nowrap ${activeTab === tab.id
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.name}
                    </button>
                ))}
            </div>

            {activeTab === 'business' && <BusinessTab />}
            {activeTab === 'users' && <UsersTab users={users} onRefresh={loadData} />}
            {activeTab === 'categories' && <CategoriesTab categories={categories} onRefresh={loadData} />}
            {activeTab === 'brands' && <BrandsTab brands={brands} onRefresh={loadData} />}
            {activeTab === 'exchange-rates' && <ExchangeRatesTab history={rateHistory} />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'integrations' && <IntegrationsTab />}
        </div>
    );
}

function BusinessTab() {
    const { businessInfo, updateBusinessInfo } = useSettingsStore();
    const [form, setForm] = useState(businessInfo);

    const handleSave = () => {
        updateBusinessInfo(form);
        toast.success('Shop details updated');
    };

    return (
        <div className="card max-w-2xl">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800 dark:text-white">Shop Profile</h3>
                <p className="text-sm text-gray-500">Customize your shop information for invoices and receipts.</p>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Shop Name</label>
                    <div className="relative">
                        <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input pl-10" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Address</label>
                    <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input pl-10" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                        <div className="relative">
                            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input pl-10" />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Receipt Footer Message</label>
                    <div className="relative">
                        <FiInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={form.receiptMessage} onChange={e => setForm({ ...form, receiptMessage: e.target.value })} className="input pl-10" placeholder="e.g. Thank you for your business!" />
                    </div>
                </div>
                <button onClick={handleSave} className="btn btn-primary mt-4">Save Changes</button>
            </div>
        </div>
    );
}

function SecurityTab() {
    const { user } = useAuthStore();
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!passwords.current || !passwords.new) {
            toast.error('Please fill in all fields');
            return;
        }
        if (passwords.new !== passwords.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await authApi.changePassword(passwords.current, passwords.new);
            toast.success('Password changed successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="card">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800 dark:text-white">User Profile</h3>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                            {user?.full_name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.full_name}</p>
                            <p className="text-gray-500 uppercase text-xs font-black tracking-widest">{user?.role} • @{user?.username}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Security Settings</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Current Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="input pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="input pl-10" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="input pl-10" />
                        </div>
                    </div>
                    <button onClick={handleChangePassword} disabled={loading} className="btn btn-primary mt-2">
                        {loading ? 'Changing...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function UsersTab({ users, onRefresh }: { users: any[]; onRefresh: () => void }) {
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ username: '', full_name: '', password: '', role: 'cashier', is_active: true });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editing) {
                const { password, ...updateData } = form;
                await userApi.update(editing.id, password ? form : updateData);
            } else {
                await userApi.create(form);
            }
            toast.success('User saved');
            setShowModal(false);
            onRefresh();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 dark:text-white">Staff Management</h3>
                <button
                    onClick={() => { setEditing(null); setForm({ username: '', full_name: '', password: '', role: 'cashier', is_active: true }); setShowModal(true); }}
                    className="btn btn-primary btn-sm"
                >
                    <FiPlus className="w-4 h-4" /> Add Staff
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <td className="px-4 py-3 text-sm font-medium">{u.full_name}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">@{u.username}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`w-2 h-2 inline-block rounded-full mr-2 ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-sm">{u.is_active ? 'Active' : 'Disabled'}</span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => { setEditing(u); setForm({ ...u, password: '' }); setShowModal(true); }}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <FiEdit2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit Staff' : 'Add New Staff'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input type="text" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="input" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password {editing && '(leave blank to keep current)'}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input">
                                    <option value="cashier">Cashier</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer pt-2">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded text-primary-600" />
                                <span className="text-sm font-medium">Account Active</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save User'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function IntegrationsTab() {
    const [proxyUrl, setProxyUrl] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('bakong_proxy_url') || '';
        setProxyUrl(stored);
    }, []);

    const handleSave = () => {
        if (proxyUrl) {
            localStorage.setItem('bakong_proxy_url', proxyUrl.trim());
        } else {
            localStorage.removeItem('bakong_proxy_url');
        }
        toast.success("Bakong Proxy URL updated!");
    };

    return (
        <div className="card max-w-2xl">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-800 dark:text-white">Bakong KHQR Proxy Setup</h3>
                <p className="text-sm text-gray-500 mt-1">Configure your local ngrok URL to verify Bakong payments from the Cafe POS.</p>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Proxy URL (e.g., https://your-ngrok-url.ngrok-free.dev)
                    </label>
                    <div className="relative">
                        <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="url" 
                            value={proxyUrl} 
                            onChange={(e) => setProxyUrl(e.target.value)} 
                            placeholder="https://...." 
                            className="input w-full pl-10"
                        />
                    </div>
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <strong>Note:</strong> Since your Cafe POS is running on Vercel (Cloud), it cannot reach your physical bank directly. You must run <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">node local-proxy.js</code> and <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">ngrok http 5005</code> on your computer in Cambodia, then paste the resulting secure URL here.
                </div>
                <div className="pt-2">
                    <button onClick={handleSave} className="btn btn-primary">
                        Save Configuration
                    </button>
                </div>
            </div>
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
