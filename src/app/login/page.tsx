'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { FiSmartphone, FiUser, FiLock, FiLoader } from 'react-icons/fi';

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please enter username and password');
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.login(username, password);
            const { user, token } = response.data.data;

            login(user, token);
            toast.success(`Welcome back, ${user.full_name}!`);

            // Redirect based on role
            if (user.role === 'cashier') {
                router.push('/pos');
            } else {
                router.push('/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full opacity-20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-500 rounded-full opacity-20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
                        <FiSmartphone className="w-10 h-10 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">MyShop POS</h1>
                    <p className="text-primary-200">Phone Shop Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                        Sign in to your account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input pl-11"
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-11"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo accounts info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 text-center mb-3">Demo Accounts:</p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-center">
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className="font-medium text-gray-700">Admin</div>
                                <div className="text-gray-500">admin / admin123</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className="font-medium text-gray-700">Manager</div>
                                <div className="text-gray-500">manager / manager123</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className="font-medium text-gray-700">Cashier</div>
                                <div className="text-gray-500">cashier1 / cashier123</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-primary-200 text-sm mt-6">
                    © 2024 MyShop POS. Built for Cambodia 🇰🇭
                </p>
            </div>
        </div>
    );
}
