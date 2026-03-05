'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCoffee, FiMapPin, FiClock, FiPhone, FiInstagram, FiFacebook, FiWifi, FiHeart, FiShoppingCart, FiPlus, FiMinus, FiX, FiCheck, FiSend, FiPackage, FiUsers, FiShield, FiLock, FiArrowLeft, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { KHQR } from '@/components/KHQR';
import { generateKHQR, DEFAULT_KHQR_CONFIG, formatPrice } from '@/lib/khqr.util';
import { CoffeeCard } from '@/components/CoffeeCard';

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

interface CartItem {
    id: string;
    menuItem: MenuItem;
    size: 'small' | 'medium' | 'large';
    quantity: number;
    customizations?: {
        sugar?: string;
        ice?: string;
    };
}


// Local Coffee & Drink Images
const coffeeImages: Record<string, string> = {
    // Hot Coffee Specialties
    'espresso': '/images/coffee/espresso.png',
    'americano': '/images/coffee/hot_americano.png',
    'cappuccino': '/images/coffee/cappuccino.png',
    'latte': '/images/coffee/hot_latte.png',
    'mocha': '/images/coffee/hot_mocha.png',
    'flat white': '/images/coffee/flat_white.png',
    'vanilla latte': '/images/coffee/vanilla_latte.png',
    'caramel latte': '/images/coffee/caramel_latte.png',
    'matcha latte': '/images/coffee/hot_matcha.png',
    'hot chocolate': '/images/coffee/hot_chocolate.png',

    // Iced Coffee Specialties
    'khmer iced coffee': '/images/coffee/khmer_iced_coffee_unique.png',
    'iced latte': '/images/coffee/iced_latte.png',
    'iced mocha': '/images/coffee/iced_mocha.png',
    'iced americano': '/images/coffee/iced_americano.png',
    'coconut coffee': '/images/coffee/coconut_coffee.png',
    'cold brew': '/images/coffee/cold_brew.png',
    'macchiato': '/images/coffee/macchiato.png',
    'vietnamese': '/images/coffee/vietnamese_coffee.png',
    'palm sugar': '/images/coffee/palm_sugar_coffee.png',
    'salted cream': '/images/coffee/salted_cream_coffee.png',

    // Blended / Frappes
    'matcha frappe': '/images/coffee/matcha_frappe.png',
    'caramel frappe': '/images/coffee/caramel_frappe.png',
    'chocolate frappe': '/images/coffee/chocolate_frappe.png',
    'coffee frappe': '/images/coffee/coffee_frappe.png',
    'mocha frappe': '/images/coffee/mocha_frappe.png',
    'java chip': '/images/coffee/java_chip_frappe.png',
    'oreo': '/images/coffee/oreo_frappe.png',
    'taro frappe': '/images/coffee/taro_frappe.png',
    'frappe': '/images/coffee/generic_frappe.png',

    // Teas
    'thai milk tea': '/images/coffee/thai_milk_tea.png',
    'brown sugar milk tea': '/images/coffee/brown_sugar_milk_tea.png',
    'taro milk tea': '/images/coffee/taro_milk_tea.png',
    'milk tea': '/images/coffee/milk_tea.png',
    'iced tea': '/images/coffee/iced_tea.png',
    'lemon tea': '/images/coffee/lemon_tea.png',
    'peach tea': '/images/coffee/peach_tea.png',
    'passion fruit tea': '/images/coffee/passion_fruit_tea.png',
    'passion fruit': '/images/coffee/passion_fruit_juice.png',
    'green tea latte': '/images/coffee/green_tea_latte.png',
    'green tea': '/images/coffee/green_tea.png',
    'jasmine': '/images/coffee/jasmine_tea.png',

    // Smoothies
    'passion fruit smoothie': '/images/coffee/passion_fruit_smoothie.png',
    'mixed berry': '/images/coffee/mixed_berry_smoothie.png',
    'mango': '/images/coffee/mango_smoothie.png',
    'strawberry': '/images/coffee/strawberry_smoothie.png',
    'banana smoothie': '/images/coffee/banana_smoothie.png',
    'avocado': '/images/coffee/avocado_smoothie.png',
    'dragon fruit': '/images/coffee/dragon_fruit_smoothie.png',

    // Fresh Drinks & Juices
    'fresh coconut': '/images/coffee/fresh_coconut.png',
    'sugar cane': '/images/coffee/sugar_cane_juice.png',
    'fresh orange': '/images/coffee/orange_juice.png',
    'lemonade': '/images/coffee/lemonade.png',
    'iced chocolate': '/images/coffee/iced_chocolate.png',
    'palm juice': '/images/coffee/palm_juice.png',
    'orange juice': '/images/coffee/orange_juice.png',

    // Food
    'chocolate croissant': '/images/coffee/chocolate_croissant.png',
    'croissant': '/images/coffee/croissant.png',
    'banana bread': '/images/coffee/banana_bread.png',
    'cheese cake': '/images/coffee/cheese_cake.png',
    'cheesecake': '/images/coffee/cheese_cake.png',
    'brownie': '/images/coffee/chocolate_brownie.png',
    'chicken sandwich': '/images/coffee/chicken_sandwich.png',
    'tuna sandwich': '/images/coffee/tuna_sandwich.png',
    'sandwich': '/images/coffee/sandwich.png',
    'waffle': '/images/coffee/waffle.png',
    'pastry': '/images/coffee/pastry.png',
    'hazelnut latte': '/images/coffee/default_drink.png',

    'default': '/images/coffee/default_drink.png',
};

const getImageForItem = (item: MenuItem, categoryIcon?: string): string => {
    // Only use image_url if it's a local path (not an external URL)
    if (item.image_url && !item.image_url.startsWith('http')) return item.image_url;

    // Try to match item name with coffee images (specific matches first)
    const nameLower = item.name.toLowerCase();
    const sortedKeys = Object.keys(coffeeImages).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
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

const getItemPrice = (item: MenuItem, size: 'small' | 'medium' | 'large'): number => {
    if (size === 'medium' && item.price_medium) {
        return typeof item.price_medium === 'string' ? parseFloat(item.price_medium) : item.price_medium;
    } else if (size === 'medium') {
        return (typeof item.base_price === 'string' ? parseFloat(item.base_price) : item.base_price) + 0.5;
    } else if (size === 'large' && item.price_large) {
        return typeof item.price_large === 'string' ? parseFloat(item.price_large) : item.price_large;
    } else if (size === 'large') {
        return (typeof item.base_price === 'string' ? parseFloat(item.base_price) : item.base_price) + 1;
    }
    return typeof item.base_price === 'string' ? parseFloat(item.base_price) : item.base_price;
};

export default function CustomerMenuPage() {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('small');
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    // Checkout form
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('takeaway');
    const [tableNumber, setTableNumber] = useState('');
    const [orderNotes, setOrderNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Order success
    const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);

    // OTP Auth state
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
    const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'checkout' | 'payment'>('phone');
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [currentBillNumber, setCurrentBillNumber] = useState('');

    // Load saved auth from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('myshop_customer_token');
        const savedPhone = localStorage.getItem('myshop_customer_phone');
        if (savedToken && savedPhone) {
            setAuthToken(savedToken);
            setVerifiedPhone(savedPhone);
            setCustomerPhone(savedPhone);
            setOtpStep('checkout');
        }
    }, []);

    // OTP resend countdown timer
    useEffect(() => {
        if (otpCountdown <= 0) return;
        const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [otpCountdown]);

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

    // Cart functions
    const addToCart = (item: MenuItem, size: 'small' | 'medium' | 'large') => {
        const existingIndex = cart.findIndex(
            c => c.menuItem.id === item.id && c.size === size
        );

        if (existingIndex >= 0) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, {
                id: `${item.id}-${size}-${Date.now()}`,
                menuItem: item,
                size,
                quantity: 1
            }]);
        }
        toast.success(`Added ${item.name} to cart!`);
        setSelectedItem(null);
    };

    const updateCartQuantity = (cartItemId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === cartItemId) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null as any;
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const removeFromCart = (cartItemId: string) => {
        setCart(cart.filter(item => item.id !== cartItemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((sum, item) => {
        return sum + getItemPrice(item.menuItem, item.size) * item.quantity;
    }, 0);

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // OTP Request handler
    const requestOtp = async () => {
        if (!customerPhone) {
            toast.error('Please enter your phone number');
            return;
        }
        setOtpLoading(true);
        setOtpError(null);
        try {
            const res = await fetch('/api/customer/otp-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: customerPhone })
            });
            const data = await res.json();
            if (data.success) {
                setOtpStep('otp');
                setOtpCountdown(60);
                setOtpCode('');
                toast.success(data.message || 'Verification code sent!');
            } else {
                throw new Error(data.message || 'Failed to send code');
            }
        } catch (error: any) {
            setOtpError(error.message);
            toast.error(error.message || 'Failed to send verification code');
        } finally {
            setOtpLoading(false);
        }
    };

    // OTP Verify handler
    const verifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) {
            toast.error('Please enter the 6-digit code');
            return;
        }
        setOtpLoading(true);
        setOtpError(null);
        try {
            const res = await fetch('/api/customer/otp-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: customerPhone, otp_code: otpCode })
            });
            const data = await res.json();
            if (data.success) {
                const token = data.data.token;
                setAuthToken(token);
                setVerifiedPhone(customerPhone);
                localStorage.setItem('myshop_customer_token', token);
                localStorage.setItem('myshop_customer_phone', customerPhone);
                if (data.data.customer?.name) {
                    setCustomerName(data.data.customer.name);
                }
                setOtpStep('checkout');
                toast.success('Phone verified!');
            } else {
                throw new Error(data.message || 'Verification failed');
            }
        } catch (error: any) {
            setOtpError(error.message);
            toast.error(error.message || 'Invalid verification code');
        } finally {
            setOtpLoading(false);
        }
    };

    // Change phone / logout
    const changePhone = () => {
        setAuthToken(null);
        setVerifiedPhone(null);
        setOtpStep('phone');
        setOtpCode('');
        setOtpError(null);
        setCustomerPhone('');
        localStorage.removeItem('myshop_customer_token');
        localStorage.removeItem('myshop_customer_phone');
    };

    // Open checkout with correct initial step
    const openCheckout = () => {
        setCartOpen(false);
        if (authToken && verifiedPhone) {
            setOtpStep('checkout');
        } else {
            setOtpStep('phone');
        }
        setOtpError(null);
        setCheckoutOpen(true);
    };

    // Submit order
    const submitOrder = async () => {
        if (!authToken) {
            toast.error('Please verify your phone number first');
            setOtpStep('phone');
            return;
        }

        if (orderType === 'dine_in' && !tableNumber) {
            toast.error('Please enter your table number');
            return;
        }

        setSubmitting(true);

        try {
            const orderItems = cart.map(item => ({
                menu_item_id: item.menuItem.id,
                size: item.size === 'small' ? 'regular' : item.size,
                quantity: item.quantity,
                customizations: item.customizations || {}
            }));

            const res = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    customer_phone: verifiedPhone || customerPhone,
                    customer_name: customerName || undefined,
                    items: orderItems,
                    order_type: orderType,
                    table_number: orderType === 'dine_in' ? parseInt(tableNumber) : undefined,
                    notes: orderNotes || undefined
                })
            });

            const data = await res.json();

            if (data.success) {
                setOrderSuccess({
                    orderNumber: data.data.order.order_number
                });
                clearCart();
                setCheckoutOpen(false);
                setCartOpen(false);
                toast.success('Order placed successfully!');
            } else if (res.status === 401) {
                // Token expired — clear and restart OTP
                changePhone();
                toast.error('Session expired. Please verify your phone again.');
            } else {
                throw new Error(data.message || 'Failed to place order');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
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

    // Order success view
    if (orderSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-green-800 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
                    <p className="text-gray-500 mb-6">Your order has been sent to the kitchen</p>

                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 mb-6">
                        <p className="text-sm opacity-80 mb-1">Order Number</p>
                        <p className="text-4xl font-black">#{orderSuccess.orderNumber.split('-').pop()}</p>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Please proceed to the counter for payment. We'll start preparing your order right away!
                    </p>

                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <p className="text-blue-800 text-sm">
                            <strong>💡 Tip:</strong> Message our Telegram bot with your phone number to get order status updates!
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/order-status"
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition"
                        >
                            Track Order
                        </Link>
                        <button
                            onClick={() => setOrderSuccess(null)}
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition"
                        >
                            Order More
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-espresso font-sans selection:bg-gold/30">


            {/* Premium Menu Hero */}
            <header className="relative bg-espresso overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/coffee/hero.png"
                        alt="Menu Background"
                        className="w-full h-full object-cover opacity-40 blur-[2px] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso to-espresso" />
                </div>

                <div className="relative z-10 container mx-auto px-4 py-20 sm:py-32">
                    <div className="flex flex-col items-center text-center">
                        {/* Elegant Badge */}
                        <div className="w-px h-12 bg-gold/50 mb-6" />
                        <span className="font-serif text-xs tracking-[0.5em] uppercase text-gold mb-4">
                            Brew & Bean
                        </span>

                        <h1 className="font-serif text-5xl sm:text-7xl font-black text-white mb-6 tracking-tight">
                            The <span className="text-gold italic">Coffee Menu</span>
                        </h1>

                        <p className="font-sans text-cream/60 max-w-md text-lg italic leading-relaxed">
                            Discover our curated selection of artisan coffees, pastries, and treats.
                        </p>

                        <div className="w-px h-12 bg-gold/50 mt-10" />
                    </div>
                </div>
            </header>

            {/* Sticky Navigation / Category Filter */}
            {categories.length > 0 && (
                <nav className="sticky top-0 z-40 bg-espresso/95 backdrop-blur-xl border-y border-gold/10">
                    <div className="container mx-auto px-4">
                        <div className="flex overflow-x-auto gap-4 py-2 sm:py-4 scrollbar-hide justify-center items-center">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex-shrink-0 px-6 py-2 rounded-full font-serif text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeCategory === cat.id
                                        ? 'bg-gold text-espresso shadow-lg'
                                        : 'text-gold/50 hover:text-gold'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>
            )}

            {/* Quick Info & Search Bar */}
            <div className="bg-espresso-light border-b border-gold/5 py-6">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 text-gold/40 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <FiClock className="text-gold" />
                            <span>07:00 AM - 10:00 PM</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiWifi className="text-gold" />
                            <span>High-speed WiFi</span>
                        </div>
                    </div>

                    <div className="relative w-full max-w-sm">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/30" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search our menu..."
                            className="w-full bg-espresso border border-gold/10 text-cream pl-12 pr-4 py-2.5 rounded-full text-sm focus:outline-none focus:border-gold/30 transition-all font-sans"
                        />
                    </div>
                </div>
            </div>

            {/* Menu Content */}
            <main className="container mx-auto px-4 py-16 pb-40">
                {categories.length === 0 ? (
                    <div className="text-center py-20">
                        <FiCoffee className="w-20 h-20 mx-auto text-gold/30 mb-6" />
                        <h2 className="text-2xl font-bold text-amber-100 mb-2 font-serif">Menu Coming Soon</h2>
                        <p className="text-amber-100/40">We&apos;re preparing something special for you!</p>
                    </div>
                ) : searchQuery.trim() ? (
                    // Search Results View — shows items across all categories
                    (() => {
                        const q = searchQuery.trim().toLowerCase();
                        const results = categories.flatMap(cat =>
                            cat.items
                                .filter(item =>
                                    item.name.toLowerCase().includes(q) ||
                                    (item.name_kh || '').toLowerCase().includes(q) ||
                                    (item.description || '').toLowerCase().includes(q)
                                )
                                .map(item => ({ item, category: cat }))
                        );
                        return results.length === 0 ? (
                            <div className="text-center py-20">
                                <FiSearch className="w-16 h-16 mx-auto text-gold/20 mb-6" />
                                <h2 className="text-2xl font-bold text-amber-100 mb-2 font-serif">No results for &ldquo;{searchQuery}&rdquo;</h2>
                                <p className="text-amber-100/40 text-sm">Try a different keyword or browse the categories above.</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-amber-100/40 text-xs uppercase tracking-[0.2em] font-bold mb-8">
                                    {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                                    {results.map(({ item, category }) => (
                                        <CoffeeCard
                                            key={item.id}
                                            item={{
                                                ...item,
                                                image_url: getImageForItem(item, category.icon)
                                            }}
                                            onClick={() => { setSelectedItem(item); setSelectedSize('small'); }}
                                            onAdd={(e) => {
                                                e.stopPropagation();
                                                addToCart(item, 'small');
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    categories.map((category) => (
                        <section
                            key={category.id}
                            id={category.id}
                            className={`mb-16 ${activeCategory === category.id ? '' : 'hidden'}`}
                        >
                            {/* Category Header */}
                            <div className="text-center mb-12">
                                {/* Decorative line */}
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/40" />
                                    <span className="text-5xl">{getCategoryIcon(category.icon)}</span>
                                    <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/40" />
                                </div>
                                <h2 className="font-serif text-4xl sm:text-5xl font-black text-amber-100 tracking-tight">{category.name}</h2>
                                {category.name_kh && (
                                    <p className="text-gold/70 text-base mt-2 font-khmer tracking-wide">{category.name_kh}</p>
                                )}
                                <div className="w-12 h-0.5 bg-gold/40 mx-auto mt-4" />
                            </div>

                            {/* Items Grid using CoffeeCard */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                                {category.items.map((item) => (
                                    <CoffeeCard
                                        key={item.id}
                                        item={{
                                            ...item,
                                            image_url: getImageForItem(item, category.icon)
                                        }}
                                        onClick={() => { setSelectedItem(item); setSelectedSize('small'); }}
                                        onAdd={(e) => {
                                            e.stopPropagation();
                                            addToCart(item, 'small');
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </main>

            {/* Item Detail Modal — dark espresso theme */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        style={{ background: 'linear-gradient(145deg, #1a1006 0%, #0f0a04 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image */}
                        <div className="aspect-video relative">
                            <img
                                src={getImageForItem(selectedItem, selectedItem.category?.icon)}
                                alt={selectedItem.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Gold gradient overlay at bottom of image */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a04] via-transparent to-transparent" />
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition border border-white/10"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8">
                            <h3 className="text-3xl font-black text-amber-100 mb-1 font-serif">{selectedItem.name}</h3>
                            {selectedItem.name_kh && (
                                <p className="text-amber-500/80 text-base mb-3 font-khmer">{selectedItem.name_kh}</p>
                            )}
                            {selectedItem.description && (
                                <p className="text-amber-100/50 text-sm mb-6 leading-relaxed italic">{selectedItem.description}</p>
                            )}

                            {/* Sizes */}
                            {selectedItem.has_sizes && (
                                <div className="space-y-3 mb-6">
                                    <p className="text-xs font-bold text-amber-400/60 uppercase tracking-[0.2em]">Select Size</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['small', 'medium', 'large'] as const).map((sz, i) => {
                                            const label = ['S', 'M', 'L'][i];
                                            const price = i === 0
                                                ? selectedItem.base_price
                                                : i === 1
                                                    ? (selectedItem.price_medium || parseFloat(String(selectedItem.base_price)) + 0.5)
                                                    : (selectedItem.price_large || parseFloat(String(selectedItem.base_price)) + 1);
                                            const isActive = selectedSize === sz;
                                            return (
                                                <button
                                                    key={sz}
                                                    onClick={() => setSelectedSize(sz)}
                                                    className={`text-center p-4 rounded-2xl border-2 transition-all duration-200 ${isActive
                                                        ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                                                        : 'border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <p className={`text-2xl font-black ${isActive ? 'text-amber-400' : 'text-amber-100/60'}`}>{label}</p>
                                                    <p className={`text-sm font-medium mt-1 ${isActive ? 'text-amber-300' : 'text-amber-100/40'}`}>{formatPrice(price)}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!selectedItem.has_sizes && (
                                <div className="text-center p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-6">
                                    <p className="text-4xl font-black text-amber-400">{formatPrice(selectedItem.base_price)}</p>
                                </div>
                            )}

                            <button
                                onClick={() => addToCart(selectedItem, selectedSize)}
                                disabled={!selectedItem.is_available}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-espresso font-bold py-4 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                            >
                                <FiShoppingCart className="w-5 h-5" />
                                Add to Cart — {formatPrice(getItemPrice(selectedItem, selectedSize))}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setCartOpen(true)}
                    className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-full shadow-2xl hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-3"
                >
                    <FiShoppingCart className="w-6 h-6" />
                    <span className="font-bold">{formatPrice(cartTotal)}</span>
                    <span className="bg-white text-amber-600 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm">
                        {cartItemCount}
                    </span>
                </button>
            )}

            {/* Cart Sidebar */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setCartOpen(false)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div
                        className="relative w-full max-w-md h-full overflow-auto animate-slide-in-right border-l border-white/5"
                        style={{ background: 'linear-gradient(180deg, #1a1006 0%, #0f0a04 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cart Header */}
                        <div className="sticky top-0 border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm" style={{ background: 'rgba(15,10,4,0.9)' }}>
                            <h2 className="text-xl font-bold text-amber-100 font-serif">Your Cart</h2>
                            <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-amber-100/60 hover:text-amber-100 transition">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="p-6 space-y-4">
                            {cart.length === 0 && (
                                <div className="text-center py-16">
                                    <FiShoppingCart className="w-14 h-14 mx-auto text-amber-500/20 mb-4" />
                                    <p className="text-amber-100/40 text-sm">No items yet.<br />Browse the menu and add your favourites!</p>
                                </div>
                            )}
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <img
                                        src={getImageForItem(item.menuItem)}
                                        alt={item.menuItem.name}
                                        className="w-20 h-20 rounded-xl object-cover"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-amber-100">{item.menuItem.name}</h3>
                                        <p className="text-xs text-amber-100/40 uppercase tracking-wider mt-0.5">Size: {item.size.toUpperCase()}</p>
                                        <p className="text-amber-400 font-bold mt-1">{formatPrice(getItemPrice(item.menuItem, item.size))}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400/60 hover:text-red-400 transition">
                                            <FiX className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateCartQuantity(item.id, -1)}
                                                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-amber-100 transition"
                                            >
                                                <FiMinus className="w-3 h-3" />
                                            </button>
                                            <span className="font-bold w-6 text-center text-amber-100">{item.quantity}</span>
                                            <button
                                                onClick={() => updateCartQuantity(item.id, 1)}
                                                className="w-8 h-8 bg-amber-500 hover:bg-amber-400 text-espresso rounded-full flex items-center justify-center transition"
                                            >
                                                <FiPlus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Footer */}
                        <div className="sticky bottom-0 border-t border-white/10 p-6 space-y-3" style={{ background: 'linear-gradient(145deg, #1a1006 0%, #0f0a04 100%)' }}>
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-amber-100/60 text-sm uppercase tracking-wider">Total</span>
                                <span className="font-black text-2xl text-amber-400">{formatPrice(cartTotal)}</span>
                            </div>
                            {cart.length === 0 ? (
                                <div className="text-center py-3">
                                    <p className="text-amber-100/40 text-sm">Your cart is empty. Add some drinks! ☕</p>
                                </div>
                            ) : (
                                <button
                                    onClick={openCheckout}
                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-espresso font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                                >
                                    <FiSend className="w-5 h-5" />
                                    Proceed to Checkout
                                </button>
                            )}
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="w-full text-amber-100/30 hover:text-amber-100/60 font-medium py-2 text-sm transition-colors"
                                >
                                    Clear Cart
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal — 3-step OTP flow */}
            {checkoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setCheckoutOpen(false)}>
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                {(otpStep === 'otp' || otpStep === 'payment') && (
                                    <button onClick={() => setOtpStep(otpStep === 'payment' ? 'checkout' : 'phone')} className="p-1 hover:bg-stone-100 rounded-full">
                                        <FiArrowLeft className="w-5 h-5 text-stone-600" />
                                    </button>
                                )}
                                <h2 className="text-xl font-bold text-stone-900">
                                    {otpStep === 'phone' ? 'Verify Phone' : otpStep === 'otp' ? 'Enter Code' : otpStep === 'payment' ? 'Payment' : 'Checkout'}
                                </h2>
                            </div>
                            <button onClick={() => setCheckoutOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Step Progress */}
                        <div className="px-6 pt-4">
                            <div className="flex items-center gap-2">
                                {['phone', 'otp', 'checkout', 'payment'].map((step, i) => (
                                    <div key={step} className="flex items-center flex-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${otpStep === step
                                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                            : ['phone', 'otp', 'checkout', 'payment'].indexOf(otpStep) > i
                                                ? 'bg-green-500 text-white'
                                                : 'bg-stone-200 text-stone-500'
                                            }`}>
                                            {['phone', 'otp', 'checkout', 'payment'].indexOf(otpStep) > i ? (
                                                <FiCheck className="w-4 h-4" />
                                            ) : (
                                                i + 1
                                            )}
                                        </div>
                                        {i < 3 && (
                                            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${['phone', 'otp', 'checkout', 'payment'].indexOf(otpStep) > i ? 'bg-green-500' : 'bg-stone-200'
                                                }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-1 px-1">
                                <span className="text-[10px] text-stone-400">Phone</span>
                                <span className="text-[10px] text-stone-400">Verify</span>
                                <span className="text-[10px] text-stone-400">Details</span>
                                <span className="text-[10px] text-stone-400">Payment</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* ========== STEP 1: Phone ========== */}
                            {otpStep === 'phone' && (
                                <>
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FiShield className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-stone-900 mb-1">Verify Your Phone</h3>
                                        <p className="text-stone-500 text-sm">We'll send you a verification code to confirm your identity</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="012 345 678"
                                            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-stone-900 placeholder-stone-400 text-lg"
                                            onKeyDown={(e) => e.key === 'Enter' && requestOtp()}
                                        />
                                    </div>

                                    {otpError && (
                                        <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                                            {otpError}
                                        </div>
                                    )}

                                    <button
                                        onClick={requestOtp}
                                        disabled={otpLoading || !customerPhone}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {otpLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Sending Code...
                                            </>
                                        ) : (
                                            <>
                                                <FiSend className="w-5 h-5" />
                                                Send Verification Code
                                            </>
                                        )}
                                    </button>

                                    {/* Order Summary Mini */}
                                    <div className="bg-stone-50 rounded-xl p-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-stone-500">{cartItemCount} items</span>
                                            <span className="font-bold text-amber-600">{formatPrice(cartTotal)}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* ========== STEP 2: OTP Verify ========== */}
                            {otpStep === 'otp' && (
                                <>
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FiLock className="w-10 h-10 text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-stone-900 mb-1">Enter Verification Code</h3>
                                        <p className="text-stone-500 text-sm">
                                            Code sent to <strong className="text-stone-700">{customerPhone}</strong>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2">6-Digit Code</label>
                                        <input
                                            type="text"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="w-full px-4 py-4 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-stone-900 placeholder-stone-300 text-center text-3xl tracking-[0.5em] font-mono"
                                            onKeyDown={(e) => e.key === 'Enter' && otpCode.length === 6 && verifyOtp()}
                                            autoFocus
                                        />
                                    </div>

                                    {otpError && (
                                        <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                                            {otpError}
                                        </div>
                                    )}

                                    <button
                                        onClick={verifyOtp}
                                        disabled={otpLoading || otpCode.length !== 6}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {otpLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck className="w-5 h-5" />
                                                Verify Code
                                            </>
                                        )}
                                    </button>

                                    {/* Resend */}
                                    <div className="text-center">
                                        {otpCountdown > 0 ? (
                                            <p className="text-stone-400 text-sm">
                                                Resend code in <span className="font-bold text-stone-600">{otpCountdown}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                onClick={requestOtp}
                                                disabled={otpLoading}
                                                className="text-amber-600 hover:text-amber-700 font-medium text-sm"
                                            >
                                                Resend Code
                                            </button>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-blue-800 text-sm">
                                            <strong>💡 Tip:</strong> Check your Telegram bot for the code, or look at the console output if testing locally.
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* ========== STEP 3: Checkout Confirm ========== */}
                            {otpStep === 'checkout' && (
                                <>
                                    {/* Verified Badge */}
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FiCheck className="w-5 h-5 text-green-600" />
                                            <span className="text-green-800 font-medium text-sm">
                                                Verified: {verifiedPhone}
                                            </span>
                                        </div>
                                        <button
                                            onClick={changePhone}
                                            className="text-xs text-stone-500 hover:text-stone-700 underline"
                                        >
                                            Change
                                        </button>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-stone-50 rounded-xl p-4">
                                        <h3 className="font-bold text-stone-700 mb-3">Order Summary</h3>
                                        <div className="space-y-2">
                                            {cart.map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.quantity}x {item.menuItem.name} ({item.size.toUpperCase()})</span>
                                                    <span className="font-medium">{formatPrice(getItemPrice(item.menuItem, item.size) * item.quantity)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between font-bold">
                                                <span>Total</span>
                                                <span className="text-amber-600">{formatPrice(cartTotal)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Type */}
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2">Order Type</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setOrderType('takeaway')}
                                                className={`p-4 rounded-xl border-2 transition ${orderType === 'takeaway' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-300'}`}
                                            >
                                                <FiPackage className="w-8 h-8 mx-auto mb-1 text-amber-600" />
                                                <span className="font-medium">Takeaway</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setOrderType('dine_in')}
                                                className={`p-4 rounded-xl border-2 transition ${orderType === 'dine_in' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-amber-300'}`}
                                            >
                                                <FiUsers className="w-8 h-8 mx-auto mb-1 text-amber-600" />
                                                <span className="font-medium">Dine-In</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table Number (for dine-in) */}
                                    {orderType === 'dine_in' && (
                                        <div>
                                            <label className="block text-sm font-bold text-stone-700 mb-2">Table Number *</label>
                                            <input
                                                type="number"
                                                value={tableNumber}
                                                onChange={(e) => setTableNumber(e.target.value)}
                                                placeholder="Enter your table number"
                                                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-stone-900 placeholder-stone-400"
                                            />
                                        </div>
                                    )}

                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2">Your Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-stone-900 placeholder-stone-400"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-bold text-stone-700 mb-2">Special Instructions (Optional)</label>
                                        <textarea
                                            value={orderNotes}
                                            onChange={(e) => setOrderNotes(e.target.value)}
                                            placeholder="Any special requests?"
                                            rows={2}
                                            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white text-stone-900 placeholder-stone-400"
                                        />
                                    </div>

                                    {/* Payment Notice */}
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-blue-800 text-sm">
                                            <strong>💳 Payment:</strong> Please pay at the counter after placing your order.
                                        </p>
                                    </div>

                                    {/* Next Step Button */}
                                    <button
                                        onClick={() => {
                                            setCurrentBillNumber(`CAFE${Date.now().toString().slice(-8)}`);
                                            setOtpStep('payment');
                                        }}
                                        disabled={orderType === 'dine_in' && !tableNumber}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <FiCheck className="w-5 h-5" />
                                        Proceed to Payment
                                    </button>
                                </>
                            )}

                            {/* ========== STEP 4: KHQR Payment ========== */}
                            {otpStep === 'payment' && (
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-stone-900 mb-1">Final Step: Payment</h3>
                                        <p className="text-stone-500 text-sm">Please scan the KHQR card below to pay</p>
                                    </div>

                                    {/* The Redesigned KHQR Card Component */}
                                    <KHQR
                                        amount={cartTotal}
                                        currency="USD"
                                        billNumber={currentBillNumber}
                                        onPaymentSuccess={() => {
                                            // Automatically submit order on success
                                            submitOrder();
                                        }}
                                    />

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-8">
                                        <button
                                            onClick={() => setOtpStep('checkout')}
                                            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold py-4 rounded-xl transition"
                                        >
                                            Back
                                        </button>

                                        {/* Submit button only kept as 'Processing' or disabled during polling */}
                                        <button
                                            disabled={true} // Disabled because we auto-submit on payment success
                                            className="flex-[2] bg-stone-200 text-stone-400 font-bold py-4 rounded-xl transition cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                                            {submitting ? 'Placing Order...' : 'Waiting for Payment'}
                                        </button>
                                    </div>


                                    <p className="mt-4 text-[10px] text-center text-stone-400">
                                        Order will be processed once payment is confirmed.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-espresso text-white py-24 border-t border-gold/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                        {/* Brand */}
                        <div className="md:col-span-12 flex flex-col items-center text-center">
                            <Link href="/" className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 border-2 border-gold rounded-xl flex items-center justify-center">
                                    <span className="font-serif text-2xl font-black text-gold">B&B</span>
                                </div>
                                <span className="text-2xl font-serif font-black tracking-[0.2em]">BREW & BEAN</span>
                            </Link>
                            <p className="text-cream/40 max-w-sm mb-10 leading-relaxed text-lg">
                                Your destination for artisan coffee and a moment of peace in Phnom Penh, Cambodia. 🇰🇭
                            </p>
                            <div className="flex items-center gap-2 text-gold/60">
                                <FiMapPin className="w-5 h-5" />
                                <span className="font-bold tracking-widest text-xs uppercase">64B street, Phnom Penh</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-12 border-t border-white/5 text-center text-cream/20 text-[10px] font-bold tracking-[0.5em] uppercase">
                        © 2024 BREW & BEAN. All Rights Reserved.
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
