'use client';

import { useState, useEffect } from 'react';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiShield } from 'react-icons/fi';

interface User {
    id: string;
    username: string;
    full_name: string;
    role: 'admin' | 'manager' | 'cashier';
    is_active: boolean;
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res = await userApi.getAll();
            setUsers(res.data.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;

        try {
            await userApi.delete(id);
            toast.success('User deactivated');
            loadUsers();
        } catch (error) {
            toast.error('Failed to deactivate user');
        }
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-red-100 text-red-700',
        manager: 'bg-blue-100 text-blue-700',
        cashier: 'bg-green-100 text-green-700',
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
                    <p className="text-gray-500">Manage system users and permissions</p>
                </div>
                <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="btn btn-primary">
                    <FiPlus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Username</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                {user.full_name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{user.username}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setEditingUser(user); setShowModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <UserModal
                    user={editingUser}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadUsers(); }}
                />
            )}
        </div>
    );
}

function UserModal({ user, onClose, onSave }: { user: User | null; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({
        username: user?.username || '',
        password: '',
        full_name: user?.full_name || '',
        role: user?.role || 'cashier',
        is_active: user?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (user) {
                const updateData: any = { full_name: form.full_name, role: form.role, is_active: form.is_active };
                if (form.password) updateData.password = form.password;
                await userApi.update(user.id, updateData);
                toast.success('User updated');
            } else {
                await userApi.create(form);
                toast.success('User created');
            }
            onSave();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user ? 'Edit User' : 'Add User'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><FiX className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Username *</label>
                        <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input" required disabled={!!user} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required={!user} minLength={6} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Role *</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} className="input">
                            <option value="cashier">Cashier</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {user && (
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded text-primary-600 focus:ring-primary-500" />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                        </div>
                    )}
                </form>

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-outline">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Save User'}</button>
                </div>
            </div>
        </div>
    );
}
