'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiMinus, FiPlus, FiDollarSign, FiCheck, FiX, FiLoader, FiPrinter, FiCoffee, FiShoppingCart } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';

interface MenuCategory {
    id: string;
    name: string;
    name_kh?: string;
    icon: string;
    items?: MenuItem[];
}

interface MenuItem {
    id: string;
    name: string;
    name_kh?: string;
    base_price: number;
    price_medium?: number;
    price_large?: number;
    has_sizes: boolean;
    has_sugar_option: boolean;
    has_ice_option: boolean;
    image_url?: string;
    category?: MenuCategory;
}

interface CartItem {
    id: string;
    menu_item_id: string;
    name: string;
    size: 'regular' | 'medium' | 'large';
    quantity: number;
    unit_price: number;
    total: number;
    customizations: {
        sugar?: string;
        ice?: string;
    };
}

const SIZE_LABELS = {
    regular: { en: 'Regular', kh: 'ធម្មតា', price: '' },
    medium: { en: 'Medium', kh: 'មធ្យម', price: '+$0.50' },
    large: { en: 'Large', kh: 'ធំ', price: '+$1.00' }
};

const SUGAR_OPTIONS = [
    { value: 'none', label: 'No Sugar', label_kh: 'គ្មានស្ករ' },
    { value: 'less', label: 'Less Sugar', label_kh: 'ស្រាលស្ករ' },
    { value: 'normal', label: 'Normal', label_kh: 'ធម្មតា' },
    { value: 'extra', label: 'Extra Sugar', label_kh: 'ស្ករច្រើន' }
];

const ICE_OPTIONS = [
    { value: 'none', label: 'No Ice', label_kh: 'គ្មានទឹកកក' },
    { value: 'less', label: 'Less Ice', label_kh: 'ទឹកកកតិច' },
    { value: 'normal', label: 'Normal', label_kh: 'ធម្មតា' },
    { value: 'extra', label: 'Extra Ice', label_kh: 'ទឹកកកច្រើន' }
];

// Helper to safely format prices (handles strings, Decimals, null, undefined)
const formatPrice = (value: any): string => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    return isNaN(num) ? 0 : num;
};

export default function CafePOSPage() {
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [exchangeRate, setExchangeRate] = useState(4100);

    // Modals
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [selectedSize, setSelectedSize] = useState<'regular' | 'medium' | 'large'>('regular');
    const [selectedSugar, setSelectedSugar] = useState('normal');
    const [selectedIce, setSelectedIce] = useState('normal');

    // Payment
    const [paidUsd, setPaidUsd] = useState(0);
    const [paidKhr, setPaidKhr] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [processing, setProcessing] = useState(false);

    // Receipt
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastOrder, setLastOrder] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, itemRes, rateRes] = await Promise.all([
                fetch('/api/cafe/menu-categories'),
                fetch('/api/cafe/menu-items?available_only=true'),
                fetch('/api/exchange-rate')
            ]);

            const catData = await catRes.json();
            const itemData = await itemRes.json();
            const rateData = await rateRes.json();

            if (catData.success) setCategories(catData.data);
            if (itemData.success) setMenuItems(itemData.data);
            if (rateData.success) setExchangeRate(parseFloat(rateData.data.usd_to_khr));
        } catch (error) {
            toast.error('Failed to load menu data');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category?.id === activeCategory;
        const matchesSearch = !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.name_kh?.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    const handleItemClick = (item: MenuItem) => {
        setSelectedItem(item);
        setSelectedSize('regular');
        setSelectedSugar('normal');
        setSelectedIce('normal');

        if (item.has_sizes) {
            setShowSizeModal(true);
        } else {
            addToCart(item, 'regular', { sugar: 'normal', ice: 'normal' });
        }
    };

    const getItemPrice = (item: MenuItem, size: 'regular' | 'medium' | 'large'): number => {
        const basePrice = toNumber(item.base_price);
        switch (size) {
            case 'medium':
                return item.price_medium ? toNumber(item.price_medium) : (basePrice + 0.50);
            case 'large':
                return item.price_large ? toNumber(item.price_large) : (basePrice + 1.00);
            default:
                return basePrice;
        }
    };

    const addToCart = (item: MenuItem, size: 'regular' | 'medium' | 'large', customizations: any) => {
        const price = getItemPrice(item, size);
        const cartItem: CartItem = {
            id: `${item.id}-${size}-${Date.now()}`,
            menu_item_id: item.id,
            name: item.name,
            size,
            quantity: 1,
            unit_price: price,
            total: price,
            customizations
        };

        setCart(prev => [...prev, cartItem]);
        toast.success(`Added ${item.name} (${size})`);
        setShowSizeModal(false);
        setSelectedItem(null);
    };

    const updateCartQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty, total: item.unit_price * newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
    const totalPaid = paidUsd + (paidKhr / exchangeRate);
    const remaining = cartTotal - totalPaid;
    const changeTotal = Math.max(0, totalPaid - cartTotal);

    let changeUsd = 0;
    let changeKhr = 0;
    if (changeTotal > 0) {
        if (changeTotal >= 20) {
            changeUsd = Math.floor(changeTotal);
            changeKhr = Math.round((changeTotal - changeUsd) * exchangeRate / 100) * 100;
        } else {
            changeKhr = Math.round(changeTotal * exchangeRate / 100) * 100;
        }
    }

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        setPaidUsd(0);
        setPaidKhr(0);
        setPaymentMethod('cash');
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        if (remaining > 0.01) {
            toast.error(`Payment insufficient. Remaining: $${formatPrice(remaining)}`);
            return;
        }

        setProcessing(true);
        try {
            // Get user from localStorage or session
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            const user = userStr ? JSON.parse(userStr) : { id: null };

            const res = await fetch('/api/cafe/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cashier_id: user.id,
                    items: cart.map(item => ({
                        menu_item_id: item.menu_item_id,
                        size: item.size,
                        quantity: item.quantity,
                        customizations: item.customizations
                    })),
                    exchange_rate: exchangeRate,
                    paid_usd: paidUsd,
                    paid_khr: paidKhr,
                    payment_method: paymentMethod
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            toast.success(`Order ${data.data.order.order_number} completed!`);

            if (data.data.payment.changeMessage !== 'Exact amount') {
                toast(data.data.payment.changeMessage, { icon: '💰', duration: 5000 });
            }

            setLastOrder(data.data.order);
            setCart([]);
            setShowPaymentModal(false);
            setShowReceiptModal(true);
        } catch (error: any) {
            toast.error(error.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Menu Panel */}
            <div className="flex-1 flex flex-col card overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-600 to-orange-600">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white">
                            <FiCoffee className="w-6 h-6" />
                            <h1 className="text-xl font-bold">Café POS</h1>
                        </div>
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search menu..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500"
                            />
                        </div>
                        <div className="text-white text-sm">
                            ៛{exchangeRate.toLocaleString()}/$
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b overflow-x-auto">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === 'all'
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100'
                            }`}
                    >
                        🍽️ All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat.id
                                ? 'bg-amber-500 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-amber-100'
                                }`}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="group bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-xl transition-all hover:scale-105 border border-gray-100 dark:border-gray-700 text-left"
                            >
                                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg mb-3 flex items-center justify-center text-4xl">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        '☕'
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-white truncate">{item.name}</h3>
                                {item.name_kh && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.name_kh}</p>
                                )}
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-lg font-bold text-amber-600">${formatPrice(item.base_price)}</span>
                                    {item.has_sizes && (
                                        <span className="text-xs text-gray-400">S/M/L</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {filteredItems.length === 0 && (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <FiCoffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No menu items found</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Panel */}
            <div className="w-96 flex flex-col card">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <div className="flex items-center gap-2">
                        <FiShoppingCart className="w-5 h-5" />
                        <h2 className="text-lg font-bold">Current Order</h2>
                    </div>
                    <p className="text-sm text-gray-400">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <FiShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Cart is empty</p>
                            </div>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 dark:text-white truncate">{item.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {SIZE_LABELS[item.size].en} • ${formatPrice(item.unit_price)}
                                        </p>
                                        {(item.customizations.sugar || item.customizations.ice) && (
                                            <p className="text-xs text-amber-600">
                                                {item.customizations.sugar !== 'normal' && item.customizations.sugar}
                                                {item.customizations.sugar !== 'normal' && item.customizations.ice !== 'normal' && ', '}
                                                {item.customizations.ice !== 'normal' && `${item.customizations.ice} ice`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateCartQuantity(item.id, -1)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                        >
                                            <FiMinus className="w-4 h-4" />
                                        </button>
                                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateCartQuantity(item.id, 1)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                        >
                                            <FiPlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="font-bold text-gray-800 dark:text-white w-16 text-right">
                                        ${formatPrice(item.total)}
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Totals & Checkout */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-2xl font-bold text-gray-800 dark:text-white">
                            <span>Total</span>
                            <span className="text-amber-600">${formatPrice(cartTotal)}</span>
                        </div>
                        <div className="text-right text-gray-500">
                            ≈ ៛{(cartTotal * exchangeRate).toLocaleString()}
                        </div>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        <FiDollarSign className="w-5 h-5" />
                        Checkout ${formatPrice(cartTotal)}
                    </button>
                </div>
            </div>

            {/* Size & Customization Modal */}
            {showSizeModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                            {selectedItem.name_kh && <p className="text-amber-100">{selectedItem.name_kh}</p>}
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Size Selection */}
                            <div>
                                <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Size / ទំហំ</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(['regular', 'medium', 'large'] as const).map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`p-4 rounded-xl border-2 transition ${selectedSize === size
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-amber-300'
                                                }`}
                                        >
                                            <p className="font-bold text-gray-800 dark:text-white">{SIZE_LABELS[size].en}</p>
                                            <p className="text-xs text-gray-500">{SIZE_LABELS[size].kh}</p>
                                            <p className="text-amber-600 font-semibold mt-1">
                                                ${formatPrice(getItemPrice(selectedItem, size))}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sugar Level */}
                            {selectedItem.has_sugar_option && (
                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Sugar / ស្ករ</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SUGAR_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSelectedSugar(opt.value)}
                                                className={`p-3 rounded-lg border-2 text-left transition ${selectedSugar === opt.value
                                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300'
                                                    }`}
                                            >
                                                <p className="font-medium text-gray-800 dark:text-white">{opt.label}</p>
                                                <p className="text-xs text-gray-500">{opt.label_kh}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ice Level */}
                            {selectedItem.has_ice_option && (
                                <div>
                                    <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Ice / ទឹកកក</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ICE_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSelectedIce(opt.value)}
                                                className={`p-3 rounded-lg border-2 text-left transition ${selectedIce === opt.value
                                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                                                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300'
                                                    }`}
                                            >
                                                <p className="font-medium text-gray-800 dark:text-white">{opt.label}</p>
                                                <p className="text-xs text-gray-500">{opt.label_kh}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t flex gap-3">
                            <button
                                onClick={() => setShowSizeModal(false)}
                                className="flex-1 btn btn-outline py-3"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => addToCart(selectedItem, selectedSize, { sugar: selectedSugar, ice: selectedIce })}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                            >
                                <FiPlus className="w-5 h-5" />
                                Add ${formatPrice(getItemPrice(selectedItem, selectedSize))}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Total */}
                            <div className="text-center">
                                <p className="text-sm text-gray-500">Amount Due</p>
                                <p className="text-4xl font-bold text-amber-600">${formatPrice(cartTotal)}</p>
                                <p className="text-gray-500">≈ ៛{(cartTotal * exchangeRate).toLocaleString()}</p>
                            </div>

                            {/* Payment Method */}
                            <div className="grid grid-cols-4 gap-2">
                                {['cash', 'card', 'khqr', 'split'].map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${paymentMethod === method
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>

                            {/* Payment Inputs */}
                            {(paymentMethod === 'cash' || paymentMethod === 'split') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Paid in USD ($)</label>
                                        <input
                                            type="number"
                                            value={paidUsd || ''}
                                            onChange={(e) => setPaidUsd(parseFloat(e.target.value) || 0)}
                                            className="input text-lg"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Paid in KHR (៛)</label>
                                        <input
                                            type="number"
                                            value={paidKhr || ''}
                                            onChange={(e) => setPaidKhr(parseFloat(e.target.value) || 0)}
                                            className="input text-lg"
                                            placeholder="0"
                                            step="1000"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Total Paid</span>
                                    <span className="font-medium">${formatPrice(totalPaid)}</span>
                                </div>
                                {remaining > 0.01 && (
                                    <div className="flex justify-between text-red-600 font-medium">
                                        <span>Remaining</span>
                                        <span>${formatPrice(remaining)}</span>
                                    </div>
                                )}
                                {remaining <= 0.01 && (changeUsd > 0 || changeKhr > 0) && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Change</span>
                                        <span>
                                            {changeUsd > 0 && `$${changeUsd} `}
                                            {changeKhr > 0 && `៛${changeKhr.toLocaleString()}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t flex gap-3">
                            <button onClick={() => setShowPaymentModal(false)} className="flex-1 btn btn-outline">
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={remaining > 0.01 || processing}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <FiLoader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FiCheck className="w-5 h-5" />
                                )}
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && lastOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="p-4 border-b flex justify-between items-center text-gray-900 dark:text-white">
                            <h3 className="text-lg font-bold">Order Complete!</h3>
                            <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg mb-6 text-center">
                                <p className="font-bold text-lg">Order #{lastOrder.order_number}</p>
                                <p className="text-sm">Transaction completed successfully.</p>
                            </div>

                            {/* Simple Receipt */}
                            <div ref={receiptRef} className="bg-white p-4 text-black text-sm border rounded-lg mb-6">
                                <div className="text-center mb-4">
                                    <h2 className="font-bold text-lg">☕ CAFÉ</h2>
                                    <p className="text-xs text-gray-500">Order #{lastOrder.order_number}</p>
                                    <p className="text-xs text-gray-500">{new Date(lastOrder.created_at).toLocaleString()}</p>
                                </div>
                                <div className="border-t border-dashed pt-2 space-y-1">
                                    {lastOrder.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between">
                                            <span>{item.quantity}x {item.name} ({item.size})</span>
                                            <span>${parseFloat(item.total).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-dashed mt-2 pt-2 font-bold flex justify-between">
                                    <span>Total</span>
                                    <span>${parseFloat(lastOrder.total_usd).toFixed(2)}</span>
                                </div>
                                <div className="text-center mt-4 text-xs text-gray-500">
                                    Thank you! / អរគុណ!
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 btn btn-primary py-3"
                                >
                                    <FiPrinter className="w-5 h-5" />
                                    Print Receipt
                                </button>
                                <button
                                    onClick={() => setShowReceiptModal(false)}
                                    className="flex-1 btn btn-outline py-3"
                                >
                                    New Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
