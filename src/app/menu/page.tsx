'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCoffee, FiMapPin, FiClock, FiPhone, FiInstagram, FiFacebook, FiWifi, FiHeart } from 'react-icons/fi';

interface MenuItem {
    id: string;
    name: string;
    name_kh?: string;
    description?: string;
    image_url?: string;
    base_price: number;
    has_sizes: boolean;
    price_medium?: number;
    price_large?: number;
    is_available: boolean;
    category?: {
        id: string;
        name: string;
        name_kh?: string;
        icon?: string;
    };
}

interface MenuCategory {
    id: string;
    name: string;
    name_kh?: string;
    icon?: string;
    items: MenuItem[];
}

const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `$${(numPrice || 0).toFixed(2)}`;
};

// Coffee placeholder images from Unsplash
const coffeeImages: Record<string, string> = {
    coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    latte: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&h=300&fit=crop',
    espresso: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop',
    cappuccino: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop',
    mocha: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop',
    americano: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=300&fit=crop',
    tea: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    matcha: 'https://images.unsplash.com/photo-1515823064-d6e0c85d9d15?w=400&h=300&fit=crop',
    smoothie: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop',
    juice: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop',
    pastry: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&h=300&fit=crop',
    cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
    food: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
    chocolate: 'https://images.unsplash.com/photo-1542990253-0b7dc279e46a?w=400&h=300&fit=crop',
    iced: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop',
    frappe: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=400&h=300&fit=crop',
    default: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
};

const getImageForItem = (item: MenuItem, categoryIcon?: string): string => {
    if (item.image_url) return item.image_url;

    // Try to match item name with coffee images
    const nameLower = item.name.toLowerCase();
    for (const key of Object.keys(coffeeImages)) {
        if (nameLower.includes(key)) {
            return coffeeImages[key];
        }
    }

    // Fall back to category-based image
    if (categoryIcon && coffeeImages[categoryIcon]) {
        return coffeeImages[categoryIcon];
    }

    return coffeeImages.default;
};

export default function CustomerMenuPage() {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const catRes = await fetch('/api/cafe/menu-categories');
            const catData = await catRes.json();

            const itemRes = await fetch('/api/cafe/menu-items?available_only=true');
            const itemData = await itemRes.json();

            if (catData.success && itemData.success) {
                const categoriesArray = Array.isArray(catData.data) ? catData.data : [];
                const itemsArray = Array.isArray(itemData.data) ? itemData.data : [];

                const grouped = categoriesArray.map((cat: any) => ({
                    ...cat,
                    items: itemsArray.filter((item: any) => item.category_id === cat.id)
                })).filter((cat: MenuCategory) => cat.items.length > 0);

                setCategories(grouped);
                if (grouped.length > 0) {
                    setActiveCategory(grouped[0].id);
                }
            } else {
                setError('Failed to load menu data');
            }
        } catch (err) {
            console.error('Failed to load menu:', err);
            setError('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (icon?: string) => {
        const icons: Record<string, string> = {
            coffee: '☕',
            tea: '🍵',
            smoothie: '🥤',
            pastry: '🥐',
            food: '🍽️',
            dessert: '🍰',
            juice: '🧃',
            cake: '🎂',
        };
        return icons[icon || ''] || '☕';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-amber-900 flex items-center justify-center">
                <div className="text-center">
                    <FiCoffee className="w-16 h-16 mx-auto text-amber-400 animate-pulse" />
                    <p className="mt-4 text-amber-200 font-medium">Loading menu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-950 to-amber-900 flex items-center justify-center">
                <div className="text-center">
                    <FiCoffee className="w-16 h-16 mx-auto text-amber-400" />
                    <p className="mt-4 text-amber-200 font-medium">{error}</p>
                    <button
                        onClick={() => { setError(null); setLoading(true); fetchMenu(); }}
                        className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-orange-50">
            {/* Hero Header */}
            <header className="relative bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white overflow-hidden">
                {/* Decorative coffee beans pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:30px_30px]" />
                </div>

                {/* Ambient glow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

                <div className="relative container mx-auto px-4 py-16 sm:py-24">
                    <div className="flex flex-col items-center text-center">
                        {/* Logo */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/30">
                            <FiCoffee className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                        </div>

                        {/* Brand Name */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-2 tracking-tight">
                            <span className="text-amber-400">my</span>Shop
                        </h1>
                        <p className="text-2xl sm:text-3xl text-amber-300 font-light tracking-[0.2em] uppercase mb-2">Coffee</p>
                        <p className="text-lg text-amber-200/80">កាហ្វេ myShop</p>

                        {/* Tagline */}
                        <p className="mt-6 text-amber-100/60 max-w-md text-center text-lg">
                            Artisan coffee crafted with passion
                        </p>

                        {/* CTA */}
                        <Link
                            href="/order-status"
                            className="mt-8 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-bold text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/30"
                        >
                            Check Order Status →
                        </Link>
                    </div>
                </div>

                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f5f5f4" />
                    </svg>
                </div>
            </header>

            {/* Quick Info Bar */}
            <div className="bg-stone-100 border-b border-stone-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-sm text-stone-600">
                        <div className="flex items-center gap-2">
                            <FiClock className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">6:00 AM - 10:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiWifi className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">Free WiFi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiPhone className="w-4 h-4 text-amber-600" />
                            <span className="font-medium">012 345 678</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            {categories.length > 0 && (
                <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg shadow-sm border-b border-stone-200">
                    <div className="container mx-auto px-4">
                        <div className="flex overflow-x-auto gap-2 py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold transition-all ${activeCategory === cat.id
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                        }`}
                                >
                                    <span className="mr-2">{getCategoryIcon(cat.icon)}</span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            )}

            {/* Menu Content */}
            <main className="container mx-auto px-4 py-12">
                {categories.length === 0 ? (
                    <div className="text-center py-20">
                        <FiCoffee className="w-20 h-20 mx-auto text-amber-300 mb-4" />
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">Menu Coming Soon</h2>
                        <p className="text-stone-500">We&apos;re preparing something special for you!</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <section
                            key={category.id}
                            id={category.id}
                            className={`mb-16 ${activeCategory === category.id ? '' : 'hidden'}`}
                        >
                            {/* Category Header */}
                            <div className="text-center mb-10">
                                <span className="text-6xl mb-4 block">{getCategoryIcon(category.icon)}</span>
                                <h2 className="text-4xl font-black text-stone-900 tracking-tight">{category.name}</h2>
                                {category.name_kh && (
                                    <p className="text-amber-600 text-lg mt-1">{category.name_kh}</p>
                                )}
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {category.items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all cursor-pointer overflow-hidden border border-stone-100 hover:border-amber-200"
                                    >
                                        {/* Image */}
                                        <div className="aspect-[4/3] relative overflow-hidden">
                                            <img
                                                src={getImageForItem(item, category.icon)}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {!item.is_available && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                                                        Sold Out
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-stone-900 text-lg group-hover:text-amber-600 transition">
                                                        {item.name}
                                                    </h3>
                                                    {item.name_kh && (
                                                        <p className="text-stone-400 text-sm">{item.name_kh}</p>
                                                    )}
                                                </div>
                                                <div className="text-right ml-3">
                                                    <p className="text-xl font-black text-amber-600">
                                                        {formatPrice(item.base_price)}
                                                    </p>
                                                    {item.has_sizes && item.price_large && (
                                                        <p className="text-xs text-stone-400">
                                                            up to {formatPrice(item.price_large)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {item.description && (
                                                <p className="text-stone-500 text-sm overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>
                                            )}
                                            {item.has_sizes && (
                                                <div className="mt-4 flex gap-2">
                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">S</span>
                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">M</span>
                                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">L</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </main>

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedItem(null)}>
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image */}
                        <div className="aspect-video relative">
                            <img
                                src={getImageForItem(selectedItem, selectedItem.category?.icon)}
                                alt={selectedItem.name}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <h3 className="text-3xl font-black text-stone-900 mb-1">{selectedItem.name}</h3>
                            {selectedItem.name_kh && (
                                <p className="text-amber-600 text-lg mb-4">{selectedItem.name_kh}</p>
                            )}
                            {selectedItem.description && (
                                <p className="text-stone-500 mb-6">{selectedItem.description}</p>
                            )}

                            {/* Sizes */}
                            {selectedItem.has_sizes && (
                                <div className="space-y-3 mb-6">
                                    <p className="text-sm font-bold text-stone-700 uppercase tracking-wider">Available Sizes</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-stone-50 rounded-2xl border-2 border-transparent hover:border-amber-400 transition cursor-pointer">
                                            <p className="text-2xl font-black text-amber-600">S</p>
                                            <p className="text-sm text-stone-600 font-medium mt-1">{formatPrice(selectedItem.base_price)}</p>
                                        </div>
                                        <div className="text-center p-4 bg-stone-50 rounded-2xl border-2 border-transparent hover:border-amber-400 transition cursor-pointer">
                                            <p className="text-2xl font-black text-amber-600">M</p>
                                            <p className="text-sm text-stone-600 font-medium mt-1">{formatPrice(selectedItem.price_medium || selectedItem.base_price + 0.5)}</p>
                                        </div>
                                        <div className="text-center p-4 bg-stone-50 rounded-2xl border-2 border-transparent hover:border-amber-400 transition cursor-pointer">
                                            <p className="text-2xl font-black text-amber-600">L</p>
                                            <p className="text-sm text-stone-600 font-medium mt-1">{formatPrice(selectedItem.price_large || selectedItem.base_price + 1)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!selectedItem.has_sizes && (
                                <div className="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl mb-6">
                                    <p className="text-4xl font-black text-amber-600">{formatPrice(selectedItem.base_price)}</p>
                                </div>
                            )}

                            <p className="text-center text-stone-400 text-sm">
                                Order at the counter • Customizations available
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-white">
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Brand */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-4 justify-center md:justify-start mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <FiCoffee className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black">
                                        <span className="text-amber-400">my</span>Shop Coffee
                                    </h3>
                                    <p className="text-amber-300/60 text-sm">កាហ្វេ myShop</p>
                                </div>
                            </div>
                            <p className="text-amber-200/60">
                                Crafting perfect moments, one cup at a time.
                            </p>
                        </div>

                        {/* Hours */}
                        <div className="text-center">
                            <h4 className="font-bold mb-4 flex items-center gap-2 justify-center text-lg">
                                <FiClock className="w-5 h-5 text-amber-400" /> Opening Hours
                            </h4>
                            <p className="text-amber-200/80">Monday - Sunday</p>
                            <p className="text-2xl font-black text-amber-400 mt-1">6:00 AM - 10:00 PM</p>
                        </div>

                        {/* Contact */}
                        <div className="text-center md:text-right">
                            <h4 className="font-bold mb-4 flex items-center gap-2 justify-center md:justify-end text-lg">
                                <FiMapPin className="w-5 h-5 text-amber-400" /> Find Us
                            </h4>
                            <p className="text-amber-200/80 mb-4">
                                Phnom Penh, Cambodia
                            </p>
                            <div className="flex gap-3 justify-center md:justify-end">
                                <a href="#" className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                                    <FiFacebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition">
                                    <FiInstagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 mt-12 pt-8 text-center">
                        <p className="text-amber-200/40 text-sm flex items-center justify-center gap-1">
                            Made with <FiHeart className="w-4 h-4 text-red-400" /> in Cambodia
                        </p>
                        <Link href="/order-status" className="text-amber-400 hover:text-amber-300 text-sm mt-3 inline-block font-medium">
                            Check Order Status →
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
