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

            {/* Hero Section - Brew & Bean Theme */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-espresso">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/Users/alvin/.gemini/antigravity/brain/8d8568e4-715a-4515-9869-2da2954b8475/hero_coffee_pour_1771436903945.png"
                        alt="Coffee Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso via-transparent to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-2xl">
                        {/* Logo / Badge */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 border-2 border-gold rounded-xl flex items-center justify-center">
                                <span className="font-serif text-3xl font-black text-gold">B&B</span>
                            </div>
                            <div className="h-12 w-px bg-gold/30" />
                            <span className="font-serif text-sm tracking-[0.4em] uppercase text-gold/80 pt-1">
                                Brew & Bean
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1]">
                            Experience the<br />
                            <span className="text-gold">Art of Coffee</span>
                        </h1>

                        <p className="font-sans text-xl text-cream/80 max-w-lg mb-10 leading-relaxed italic">
                            Crafting exceptional coffee with passion and precision. Discover your next favorite blend.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/menu"
                                className="inline-flex items-center justify-center px-10 py-4 bg-gold hover:bg-gold-light text-espresso font-serif text-lg font-bold rounded-full transition-all duration-300 shadow-2xl shadow-gold/20"
                            >
                                VIEW MENU
                            </Link>
                            <Link
                                href="#phones"
                                className="inline-flex items-center justify-center px-10 py-4 border border-gold/50 hover:bg-gold/10 text-gold font-serif text-lg font-bold rounded-full transition-all duration-300"
                            >
                                BROWSE PHONES
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Vertical Text Decoration */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
                    <div className="flex flex-col items-center gap-8">
                        <div className="w-px h-24 bg-gold/30" />
                        <span className="font-serif text-xs tracking-[1em] uppercase text-gold/40 vertical-text rotate-180 mb-4 whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                            SINCE 2024
                        </span>
                        <div className="w-px h-24 bg-gold/30" />
                    </div>
                </div>
            </section>

            {/* Features Bar - Brew & Bean Style */}
            <section className="bg-espresso-light border-y border-gold/10 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-8">
                        <div className="flex flex-col items-center text-center">
                            <FiCoffee className="w-8 h-8 text-gold mb-4" />
                            <h4 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-gold/90">Artisan Brews</h4>
                            <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest leading-relaxed">Exceptional coffee<br />made with care</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiClock className="w-8 h-8 text-gold mb-4" />
                            <h4 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-gold/90">Relaxing Atmosphere</h4>
                            <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest leading-relaxed">A cozy space to<br />unwind and savor</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiSmartphone className="w-8 h-8 text-gold mb-4" />
                            <h4 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-gold/90">Premium Devices</h4>
                            <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest leading-relaxed">Official warranty<br />on all gadgets</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <FiSmartphone className="w-8 h-8 text-gold mb-4" /> {/* Reusing icon for Fresh Beans look */}
                            <h4 className="font-serif text-sm font-bold uppercase tracking-[0.2em] text-gold/90">Fresh Ground Beans</h4>
                            <p className="text-xs text-cream/40 mt-1 uppercase tracking-widest leading-relaxed">Quality coffee from<br />freshly ground beans</p>
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

            {/* Coffee Section Promo - Redesigned */}
            <section id="coffee" className="py-32 bg-espresso relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-cream/5 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center mb-16">
                        <div className="w-20 h-px bg-gold/50 mb-8" />
                        <h2 className="font-serif text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                            Sample Our <span className="text-gold italic">Artisan Brews</span>
                        </h2>
                        <p className="font-sans text-cream/60 max-w-2xl text-lg leading-relaxed mb-12">
                            Each cup is a journey of flavor, meticulously prepared by our expert baristas to give you the perfect morning or afternoon pick-me-up.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Featured Coffee Cards */}
                        <div className="flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group">
                            <div className="relative aspect-square">
                                <img src="/Users/alvin/.gemini/antigravity/brain/8d8568e4-715a-4515-9869-2da2954b8475/coffee_menu_items_1771436921810.png" alt="Flat White" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" style={{ objectPosition: '0 0', width: '200%', height: '200%' }} />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Flat White</h3>
                                <p className="font-serif text-gold font-black mt-2">$2.99</p>
                            </div>
                        </div>
                        <div className="flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group lg:mt-8">
                            <div className="relative aspect-square">
                                <img src="/Users/alvin/.gemini/antigravity/brain/8d8568e4-715a-4515-9869-2da2954b8475/coffee_menu_items_1771436921810.png" alt="Caramel Latte" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" style={{ objectPosition: '100% 0', width: '200%', height: '200%' }} />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Caramel Latte</h3>
                                <p className="font-serif text-gold font-black mt-2">$2.99</p>
                            </div>
                        </div>
                        <div className="flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group">
                            <div className="relative aspect-square">
                                <img src="/Users/alvin/.gemini/antigravity/brain/8d8568e4-715a-4515-9869-2da2954b8475/coffee_menu_items_1771436921810.png" alt="Cappuccino" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" style={{ objectPosition: '0 100%', width: '200%', height: '200%' }} />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Cappuccino</h3>
                                <p className="font-serif text-gold font-black mt-2">$2.99</p>
                            </div>
                        </div>
                        <div className="flex flex-col bg-cream rounded-2xl overflow-hidden shadow-2xl group lg:mt-8">
                            <div className="relative aspect-square">
                                <img src="/Users/alvin/.gemini/antigravity/brain/8d8568e4-715a-4515-9869-2da2954b8475/coffee_menu_items_1771436921810.png" alt="Espresso" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" style={{ objectPosition: '100% 100%', width: '200%', height: '200%' }} />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-serif text-xl font-bold text-espresso">Espresso</h3>
                                <p className="font-serif text-gold font-black mt-2">$1.99</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 text-center">
                        <Link
                            href="/menu"
                            className="inline-flex items-center gap-2 font-serif text-lg font-bold text-gold hover:text-gold-light transition-colors group"
                        >
                            EXPLORE ENTIRE MENU
                            <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
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
