'use client';

import Link from 'next/link';
import { FiSmartphone, FiCoffee, FiMenu, FiX } from 'react-icons/fi';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-lg">M</span>
                        </div>
                        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-indigo-500 to-amber-500">
                            MyShop
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {/* Phone Shop Links */}
                        <div className="flex items-center gap-6">
                            <Link href="#phones" className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                <FiSmartphone className="w-4 h-4" />
                                Phones
                            </Link>
                            <Link href="#warranty" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                Warranty
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

                        {/* Coffee Links */}
                        <div className="flex items-center gap-6">
                            <Link href="/menu" className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                <FiCoffee className="w-4 h-4" />
                                Coffee Menu
                            </Link>
                            <Link href="/order-status" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                Order Status
                            </Link>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

                        <Link href="#about" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            About Us
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="space-y-1">
                            <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Shop</p>
                            <Link href="#phones" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <FiSmartphone className="w-5 h-5 text-primary-600" />
                                Browse Phones
                            </Link>
                            <Link href="#warranty" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                Check Warranty
                            </Link>

                            <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

                            <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Coffee Shop</p>
                            <Link href="/menu" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                <FiCoffee className="w-5 h-5 text-amber-600" />
                                Coffee Menu
                            </Link>
                            <Link href="/order-status" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                Order Status
                            </Link>

                            <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

                            <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                About Us
                            </Link>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                Staff Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
