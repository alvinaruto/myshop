'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { WarrantyCheck } from '@/components/WarrantyCheck';
import { ProductQuickView } from '@/components/ProductQuickView';
import { FiSearch, FiFilter, FiLoader, FiArrowRight, FiSmartphone, FiShield, FiZap, FiBox } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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

    const featuredProducts = products.slice(0, 3);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <Navbar />

            {/* Hero Section - Redesigned for Premium Feel */}
            <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-40 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-fadeIn">
                                <FiZap className="fill-current" /> Certified Retailer 🇰🇭
                            </div>
                            <h1 className="text-6xl lg:text-8xl font-black text-gray-900 dark:text-white mb-8 leading-[0.9] tracking-tighter">
                                Precision. <br />
                                <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-500">Exhibition.</span>
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-xl mb-12">
                                Discover the next generation of mobile excellence. We curate only the most reliable devices with full official warranties.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link href="#exhibition" className="btn btn-primary px-10 py-5 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/40 group">
                                    Explore Store <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="#warranty" className="px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary-600 transition-colors">
                                    Check Warranty
                                </Link>
                            </div>
                        </div>

                        <div className="flex-1 relative perspective-1000 hidden lg:block">
                            <div className="relative animate-float">
                                <div className="w-80 h-[100%] bg-gradient-to-br from-primary-600 to-indigo-600 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(79,70,229,0.5)] flex items-center justify-center p-8 transform rotate-6 hover:rotate-0 transition-transform duration-700">
                                    <FiSmartphone className="text-white w-48 h-48 drop-shadow-2xl" />
                                </div>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 transform -rotate-12">
                                    <FiShield className="text-primary-600 w-12 h-12 mb-2" />
                                    <span className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest text-center px-4">Official Coverage</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
            </section>

            {/* Features Bar */}
            <section className="bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700 py-12 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div className="flex flex-col items-center text-center">
                            <FiBox className="w-8 h-8 text-primary-600 mb-4" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Same Day Delivery</h4>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiShield className="w-8 h-8 text-primary-600 mb-4" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Verified Warranty</h4>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiZap className="w-8 h-8 text-primary-600 mb-4" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Rapid Support</h4>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiSmartphone className="w-8 h-8 text-primary-600 mb-4" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Premium Quality</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Section */}
            <main id="exhibition" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="text-center mb-20">
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">
                        Exhibition Collection
                    </h2>
                    <div className="w-20 h-2 bg-primary-600 mx-auto rounded-full mb-12" />

                    {/* Search and Filters Bar - Redesigned */}
                    <div className="max-w-4xl mx-auto bg-gray-50 dark:bg-gray-800/50 p-2 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search our exhibition..."
                                className="w-full pl-16 pr-8 py-5 bg-white dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-bold tracking-tight shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative md:w-64">
                            <FiFilter className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                className="w-full pl-16 pr-10 py-5 bg-white dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white font-bold appearance-none shadow-sm cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Items</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-gray-500 gap-6">
                        <FiLoader className="w-16 h-16 animate-spin text-primary-600" />
                        <p className="font-black uppercase tracking-[0.4em] text-xs animate-pulse">Loading Catalog</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] flex items-center justify-center mb-8 border border-gray-100 dark:border-gray-700">
                            <FiSearch className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">No results found</h3>
                        <p className="text-gray-500 max-w-sm font-medium">We couldn't find any products matching your current search criteria.</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                            className="mt-10 text-primary-600 font-black uppercase tracking-[0.25em] text-xs hover:tracking-[0.35em] transition-all"
                        >
                            Reset Exhibition
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
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

            {/* Warranty Check Tool */}
            <WarrantyCheck />

            {/* About Section - "Our Story" */}
            <section id="about" className="py-32 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <div className="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-[4rem] relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-transparent" />
                                <div className="absolute inset-12 border-2 border-primary-600/10 rounded-[3rem] group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FiSmartphone className="w-32 h-32 text-primary-600 opacity-20" />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-5xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter">Our Story</h2>
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                                Founded in the heart of Cambodia, MyShop has grown from a local boutique to a premium tech exhibition hub. We believe that mobile technology should be accessible, reliable, and perfectly suited to our customers' lifestyles.
                            </p>
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-12">
                                Every device in our exhibition undergoes a rigorous 50-point quality check before it reaches your hands. That's our promise of excellence.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-4xl font-black text-primary-600 mb-2">10k+</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Happy Clients</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-primary-600 mb-2">100%</p>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Official Tech</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 py-20 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <div className="text-center md:text-left">
                            <Link href="/" className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <FiSmartphone className="text-white w-5 h-5" />
                                </div>
                                <span className="text-xl font-black dark:text-white">MyShop</span>
                            </Link>
                            <p className="text-gray-400 font-medium text-sm max-w-xs">
                                The leading premium device exhibitor in Cambodia. 🇰🇭
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                            <Link href="#exhibition" className="hover:text-primary-600 transition-colors">Shop</Link>
                            <Link href="#warranty" className="hover:text-primary-600 transition-colors">Warranty</Link>
                            <Link href="#about" className="hover:text-primary-600 transition-colors">About</Link>
                            <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 hidden md:block" />
                            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                                Staff Portal
                            </Link>
                        </div>
                    </div>

                    <div className="mt-20 pt-8 border-t border-gray-200/50 dark:border-gray-800 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-300 dark:text-gray-600">
                            © 2024 MyShop Premium Tech Hub. All Rights Reserved.
                        </p>
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
