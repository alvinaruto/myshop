'use client';

import Link from 'next/link';
import { FiCoffee, FiMenu, FiX, FiClock, FiMapPin } from 'react-icons/fi';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-espresso/95 backdrop-blur-xl border-b border-gold/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo - Brew & Bean style */}
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 border-2 border-gold rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 duration-500">
                            <span className="font-serif text-2xl font-black text-gold">B&B</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-serif font-black tracking-[0.2em] text-white">
                                BREW & BEAN
                            </span>
                            <span className="text-[10px] font-sans font-bold tracking-[0.4em] text-gold/60 uppercase">
                                Artisan Coffee
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        <Link href="/menu" className="flex items-center gap-2 font-sans text-sm font-bold tracking-widest text-cream/70 hover:text-gold transition-all duration-300">
                            <FiCoffee className="w-4 h-4" />
                            MENU
                        </Link>
                        <Link href="/order-status" className="font-sans text-sm font-bold tracking-widest text-cream/70 hover:text-gold transition-all duration-300">
                            ORDER STATUS
                        </Link>
                        <Link href="#about" className="font-sans text-sm font-bold tracking-widest text-cream/70 hover:text-gold transition-all duration-300">
                            OUR STORY
                        </Link>

                        {/* Action - Order Now button style */}
                        <Link
                            href="/menu"
                            className="px-6 py-2.5 bg-gold hover:bg-gold-light text-espresso font-serif text-sm font-black rounded-full transition-all duration-300 shadow-xl shadow-gold/10"
                        >
                            ORDER NOW
                        </Link>
                    </div>

                    {/* Left Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-4 mr-4 pr-4 border-r border-white/10">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-gold/60 uppercase tracking-widest">Open Now</span>
                                <span className="text-xs font-bold text-cream/90">6AM - 10PM</span>
                            </div>
                        </div>

                        <ThemeToggle />

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-cream hover:bg-white/5 transition"
                        >
                            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col gap-6 px-2">
                            <Link
                                href="/menu"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between px-4 py-3 text-cream/80 hover:text-gold hover:bg-white/5 rounded-xl transition-all"
                            >
                                <span className="text-lg font-serif font-bold">Coffee Menu</span>
                                <FiCoffee className="w-5 h-5 text-gold" />
                            </Link>
                            <Link
                                href="/order-status"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between px-4 py-3 text-cream/80 hover:text-gold hover:bg-white/5 rounded-xl transition-all"
                            >
                                <span className="text-lg font-serif font-bold">Order Status</span>
                                <FiClock className="w-5 h-5 text-gold" />
                            </Link>
                            <Link
                                href="#about"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between px-4 py-3 text-cream/80 hover:text-gold hover:bg-white/5 rounded-xl transition-all"
                            >
                                <span className="text-lg font-serif font-bold">Our Story</span>
                                <FiMapPin className="w-5 h-5 text-gold" />
                            </Link>

                            <div className="mt-4">
                                <Link
                                    href="/menu"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full h-14 flex items-center justify-center bg-gold text-espresso font-serif text-lg font-black rounded-2xl shadow-2xl"
                                >
                                    ORDER NOW
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
