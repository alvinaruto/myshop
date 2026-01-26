'use client';

import Link from 'next/link';
import { FiSmartphone, FiUser, FiShoppingCart, FiSearch } from 'react-icons/fi';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '@/stores/authStore';

export const Navbar = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                            <FiSmartphone className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">
                            MyShop
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="#exhibition" className="text-sm font-black text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-[0.2em]">
                            Exhibition
                        </Link>
                        <Link href="#warranty" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-[0.2em]">
                            Warranty
                        </Link>
                        <Link href="#about" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-[0.2em]">
                            Our Story
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
};
