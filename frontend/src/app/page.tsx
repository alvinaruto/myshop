'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { WarrantyCheck } from '@/components/WarrantyCheck';
import { ProductQuickView } from '@/components/ProductQuickView';
import { FiSearch, FiFilter, FiLoader, FiArrowRight, FiSmartphone, FiShield, FiZap, FiBox, FiCoffee, FiClock, FiMapPin, FiHeart } from 'react-icons/fi';

const API_URL = '/api';

export default function HomePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [prodRes, catRes] = await Promise.all([
                    axios.get(`${API_URL}/public/products?limit=50`),
                    axios.get(`${API_URL}/public/categories`)
                ]);
                setProducts(prodRes.data.data.products);
                setCategories(catRes.data.data);
            } catch (error) {
                console.error('Failed to load catalog:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Navbar />

            {/* Hero Section - Dual Purpose */}
            <section className="relative overflow-hidden pt-20 pb-32 lg:pt-28 lg:pb-40 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                {/* Ambient Effects */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-bold mb-8">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Certified Retailer • Phnom Penh, Cambodia 🇰🇭
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-6 leading-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-indigo-400 to-amber-400">
                                MyShop
                            </span>
                        </h1>
                        <p className="text-xl sm:text-2xl text-gray-300 font-medium max-w-2xl mx-auto mb-4">
                            Premium Phones & Artisan Coffee
                        </p>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Two passions. One destination. Discover cutting-edge mobile tech and handcrafted coffee under one roof.
                        </p>
                    </div>

                    {/* Dual Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                        {/* Phone Shop Card */}
                        <Link href="#phones" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-600 p-8 lg:p-10 hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiSmartphone className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">Phone Shop</h3>
                                <p className="text-primary-100 mb-6">Premium smartphones with official warranty. Same-day delivery available.</p>
                                <div className="flex items-center gap-2 text-white font-bold">
                                    Browse Phones <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>

                        {/* Coffee Shop Card */}
                        <Link href="/menu" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 to-orange-600 p-8 lg:p-10 hover:scale-[1.02] transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <FiCoffee className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-black text-white mb-3">Coffee Shop</h3>
                                <p className="text-amber-100 mb-6">Artisan coffee crafted with passion. Fresh beans roasted daily.</p>
                                <div className="flex items-center gap-2 text-white font-bold">
                                    View Menu <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center text-center">
                            <FiBox className="w-7 h-7 text-primary-600 mb-3" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Same Day Delivery</h4>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiShield className="w-7 h-7 text-primary-600 mb-3" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Official Warranty</h4>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiCoffee className="w-7 h-7 text-amber-600 mb-3" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Fresh Coffee Daily</h4>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiZap className="w-7 h-7 text-amber-600 mb-3" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">Free WiFi</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* Phone Catalog Section */}
            <main id="phones" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold mb-6">
                        <FiSmartphone className="w-4 h-4" />
                        Phone Shop
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        Premium Devices
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        Discover the latest smartphones with full official warranties and expert support.
                    </p>

                    {/* Search and Filters */}
                    <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-2 shadow-sm">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search phones..."
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative md:w-56">
                            <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-medium appearance-none cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-gray-500 gap-4">
                        <FiLoader className="w-12 h-12 animate-spin text-primary-600" />
                        <p className="font-bold uppercase tracking-widest text-xs">Loading Catalog</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
                            <FiSearch className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
                        <p className="text-gray-500 max-w-sm">Try adjusting your search criteria.</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                            className="mt-6 text-primary-600 font-bold text-sm hover:underline"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product: any) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => setSelectedProduct(product)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Warranty Check */}
            <WarrantyCheck />

            {/* Coffee Section Promo */}
            <section id="coffee" className="py-24 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 text-sm font-bold mb-6">
                                <FiCoffee className="w-4 h-4" />
                                myShop Coffee
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-black mb-6">
                                Artisan Coffee,<br />
                                <span className="text-amber-400">Crafted Daily</span>
                            </h2>
                            <p className="text-amber-100/80 text-lg mb-8 max-w-lg">
                                Take a break from browsing phones and enjoy our freshly roasted coffee. Every cup is made with care.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                                <Link href="/menu" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30">
                                    View Full Menu <FiArrowRight />
                                </Link>
                                <Link href="/order-status" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-bold hover:bg-white/20 transition">
                                    Check Order Status
                                </Link>
                            </div>

                            <div className="flex items-center gap-6 text-amber-200/80">
                                <div className="flex items-center gap-2">
                                    <FiClock className="w-5 h-5 text-amber-400" />
                                    <span>6AM - 10PM</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiMapPin className="w-5 h-5 text-amber-400" />
                                    <span>Phnom Penh</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-amber-600/30 to-orange-600/30 rounded-[3rem] flex items-center justify-center">
                                <div className="w-3/4 h-3/4 bg-gradient-to-br from-amber-500/50 to-orange-500/50 rounded-[2rem] flex items-center justify-center">
                                    <FiCoffee className="w-32 h-32 text-white/30" />
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl">
                                <p className="text-4xl font-black text-amber-600">$2.50</p>
                                <p className="text-sm text-gray-500">Starting from</p>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">☕ Espresso</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">🍵 Tea</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">🥤 Smoothies</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">Our Story</h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                            Founded in the heart of Phnom Penh, MyShop combines two of Cambodia's growing passions:
                            cutting-edge mobile technology and artisan coffee culture. We believe that great technology
                            and great coffee both deserve attention to detail.
                        </p>
                        <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-12">
                            Whether you're here to find your next smartphone or to enjoy a perfectly crafted latte,
                            we promise an experience that goes beyond expectations.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <p className="text-4xl font-black text-primary-600 mb-2">10k+</p>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Happy Clients</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-primary-600 mb-2">100%</p>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Official Warranty</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-amber-600 mb-2">5k+</p>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Cups Served</p>
                            </div>
                            <div>
                                <p className="text-4xl font-black text-amber-600 mb-2">4.9</p>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Customer Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <Link href="/" className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-amber-500 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black">M</span>
                                </div>
                                <span className="text-2xl font-black">MyShop</span>
                            </Link>
                            <p className="text-gray-400 max-w-sm mb-6">
                                Your destination for premium smartphones and artisan coffee in Phnom Penh, Cambodia. 🇰🇭
                            </p>
                            <p className="text-gray-500 text-sm flex items-center gap-1">
                                Made with <FiHeart className="w-4 h-4 text-red-500" /> in Cambodia
                            </p>
                        </div>

                        {/* Phone Shop Links */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Phone Shop</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="#phones" className="hover:text-white transition">Browse Phones</Link></li>
                                <li><Link href="#warranty" className="hover:text-white transition">Check Warranty</Link></li>
                                <li><Link href="/login" className="hover:text-white transition">Staff Portal</Link></li>
                            </ul>
                        </div>

                        {/* Coffee Links */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">Coffee Shop</h4>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="/menu" className="hover:text-white transition">Coffee Menu</Link></li>
                                <li><Link href="/order-status" className="hover:text-white transition">Order Status</Link></li>
                                <li><span className="text-gray-500">Open 6AM - 10PM</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                        © 2024 MyShop. All Rights Reserved.
                    </div>
                </div>
            </footer>

            {/* Quick View Modal */}
            {selectedProduct && (
                <ProductQuickView
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}
