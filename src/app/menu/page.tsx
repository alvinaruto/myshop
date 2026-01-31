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

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

export default function CustomerMenuPage() {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            // Fetch categories
            const catRes = await fetch('/api/cafe/menu-categories');
            const catData = await catRes.json();

            // Fetch items
            const itemRes = await fetch('/api/cafe/menu-items?available_only=true');
            const itemData = await itemRes.json();

            if (catData.success && itemData.success) {
                // Group items by category
                const grouped = catData.data.map((cat: any) => ({
                    ...cat,
                    items: itemData.data.filter((item: any) => item.category_id === cat.id)
                })).filter((cat: MenuCategory) => cat.items.length > 0);

                setCategories(grouped);
                if (grouped.length > 0) {
                    setActiveCategory(grouped[0].id);
                }
            }
        } catch (error) {
            console.error('Failed to load menu');
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
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <FiCoffee className="w-16 h-16 mx-auto text-amber-600 animate-pulse" />
                    <p className="mt-4 text-amber-800 font-medium">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            {/* Hero Header */}
            <header className="relative bg-gradient-to-r from-amber-900 via-orange-900 to-red-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }} />
                </div>
                <div className="relative container mx-auto px-4 py-12 sm:py-20">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-amber-500 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                            <FiCoffee className="w-10 h-10 sm:w-12 sm:h-12" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2">MARA LAVIN</h1>
                        <p className="text-xl sm:text-2xl text-amber-300 font-medium mb-1">CAFÉ</p>
                        <p className="text-lg text-amber-200 font-khmer">មារ៉ា ឡាវីន កាហ្វេ</p>
                        <p className="mt-4 text-amber-100 max-w-md text-center">
                            Freshly roasted coffee, handcrafted with love
                        </p>
                    </div>
                </div>
                {/* Wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fffbeb" />
                    </svg>
                </div>
            </header>

            {/* Quick Info Bar */}
            <div className="bg-amber-100 border-b border-amber-200">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-amber-800">
                        <div className="flex items-center gap-2">
                            <FiClock className="w-4 h-4" />
                            <span>6:00 AM - 10:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiWifi className="w-4 h-4" />
                            <span>Free WiFi</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiPhone className="w-4 h-4" />
                            <span>012 345 678</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg shadow-sm border-b border-amber-100">
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto gap-2 py-3 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${activeCategory === cat.id
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                    }`}
                            >
                                <span className="mr-2">{getCategoryIcon(cat.icon)}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Menu Content */}
            <main className="container mx-auto px-4 py-8">
                {categories.map((category) => (
                    <section
                        key={category.id}
                        id={category.id}
                        className={`mb-12 ${activeCategory === category.id ? '' : 'hidden'}`}
                    >
                        {/* Category Header */}
                        <div className="text-center mb-8">
                            <span className="text-5xl mb-3 block">{getCategoryIcon(category.icon)}</span>
                            <h2 className="text-3xl font-bold text-amber-900">{category.name}</h2>
                            {category.name_kh && (
                                <p className="text-amber-600 text-lg font-khmer">{category.name_kh}</p>
                            )}
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-amber-100"
                                >
                                    {/* Image */}
                                    <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 relative overflow-hidden">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-6xl opacity-50">{getCategoryIcon(category.icon)}</span>
                                            </div>
                                        )}
                                        {!item.is_available && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                                                    Sold Out
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-amber-600 transition">
                                                    {item.name}
                                                </h3>
                                                {item.name_kh && (
                                                    <p className="text-gray-500 text-sm font-khmer">{item.name_kh}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-amber-600">
                                                    {formatPrice(item.base_price)}
                                                </p>
                                                {item.has_sizes && item.price_large && (
                                                    <p className="text-xs text-gray-400">
                                                        up to {formatPrice(item.price_large)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {item.description && (
                                            <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                                        )}
                                        {item.has_sizes && (
                                            <div className="mt-3 flex gap-2">
                                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">S</span>
                                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">M</span>
                                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">L</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedItem(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image */}
                        <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 relative">
                            {selectedItem.image_url ? (
                                <img
                                    src={selectedItem.image_url}
                                    alt={selectedItem.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-8xl opacity-30">{getCategoryIcon(selectedItem.category?.icon)}</span>
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedItem.name}</h3>
                            {selectedItem.name_kh && (
                                <p className="text-amber-600 font-khmer mb-3">{selectedItem.name_kh}</p>
                            )}
                            {selectedItem.description && (
                                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                            )}

                            {/* Sizes */}
                            {selectedItem.has_sizes && (
                                <div className="space-y-2 mb-6">
                                    <p className="text-sm font-medium text-gray-700">Available Sizes:</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center p-3 bg-amber-50 rounded-xl">
                                            <p className="text-lg font-bold text-amber-600">S</p>
                                            <p className="text-sm text-gray-600">{formatPrice(selectedItem.base_price)}</p>
                                        </div>
                                        <div className="text-center p-3 bg-amber-50 rounded-xl">
                                            <p className="text-lg font-bold text-amber-600">M</p>
                                            <p className="text-sm text-gray-600">{formatPrice(selectedItem.price_medium || selectedItem.base_price + 0.5)}</p>
                                        </div>
                                        <div className="text-center p-3 bg-amber-50 rounded-xl">
                                            <p className="text-lg font-bold text-amber-600">L</p>
                                            <p className="text-sm text-gray-600">{formatPrice(selectedItem.price_large || selectedItem.base_price + 1)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!selectedItem.has_sizes && (
                                <div className="text-center p-4 bg-amber-50 rounded-xl mb-6">
                                    <p className="text-3xl font-bold text-amber-600">{formatPrice(selectedItem.base_price)}</p>
                                </div>
                            )}

                            <p className="text-center text-gray-400 text-sm">
                                Order at the counter • Ask about customizations
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-gradient-to-r from-amber-900 via-orange-900 to-red-900 text-white mt-12">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Brand */}
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                                    <FiCoffee className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">MARA LAVIN CAFÉ</h3>
                                    <p className="text-amber-300 text-sm font-khmer">មារ៉ា ឡាវីន កាហ្វេ</p>
                                </div>
                            </div>
                            <p className="text-amber-200 text-sm">
                                Crafting perfect moments, one cup at a time.
                            </p>
                        </div>

                        {/* Hours */}
                        <div className="text-center">
                            <h4 className="font-bold mb-3 flex items-center gap-2 justify-center">
                                <FiClock className="w-4 h-4" /> Opening Hours
                            </h4>
                            <p className="text-amber-200">Monday - Sunday</p>
                            <p className="text-xl font-bold text-amber-300">6:00 AM - 10:00 PM</p>
                        </div>

                        {/* Contact */}
                        <div className="text-center md:text-right">
                            <h4 className="font-bold mb-3 flex items-center gap-2 justify-center md:justify-end">
                                <FiMapPin className="w-4 h-4" /> Find Us
                            </h4>
                            <p className="text-amber-200 text-sm mb-3">
                                Phnom Penh, Cambodia
                            </p>
                            <div className="flex gap-4 justify-center md:justify-end">
                                <a href="#" className="w-10 h-10 bg-amber-800 hover:bg-amber-700 rounded-full flex items-center justify-center transition">
                                    <FiFacebook className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 bg-amber-800 hover:bg-amber-700 rounded-full flex items-center justify-center transition">
                                    <FiInstagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-amber-800 mt-8 pt-8 text-center">
                        <p className="text-amber-300 text-sm flex items-center justify-center gap-1">
                            Made with <FiHeart className="w-4 h-4 text-red-400" /> in Cambodia
                        </p>
                        <Link href="/cafe/queue" className="text-amber-400 hover:text-amber-300 text-sm mt-2 inline-block">
                            Check Order Status →
                        </Link>
                    </div>
                </div>
            </footer>

            {/* Custom Styles */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .font-khmer {
                    font-family: 'Noto Sans Khmer', sans-serif;
                }
            `}</style>
        </div>
    );
}
