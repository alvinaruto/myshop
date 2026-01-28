'use client';

import { useState, useEffect, useRef } from 'react';
import { productApi, serialApi, saleApi, exchangeRateApi } from '@/lib/api';
import { useCartStore, CartItem } from '@/stores/cartStore';
import toast from 'react-hot-toast';
import { FiSearch, FiTrash2, FiMinus, FiPlus, FiDollarSign, FiCheck, FiX, FiLoader, FiPrinter, FiCamera } from 'react-icons/fi';
import { useReactToPrint } from 'react-to-print';
import { Receipt } from '@/components/Receipt';
import { KHQR } from '@/components/KHQR';
import { BarcodeScanner } from '@/components/BarcodeScanner';

interface Product {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    selling_price: number;
    is_serialized: boolean;
    available_stock: number;
    category?: { name: string };
    brand?: { name: string };
}

interface SerialItem {
    id: string;
    imei?: string;
    serial_number?: string;
    product: Product;
}

export default function POSPage() {
    const searchRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const [showSerialModal, setShowSerialModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [serialSearch, setSerialSearch] = useState('');
    const [serialItems, setSerialItems] = useState<SerialItem[]>([]);
    const [processing, setProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [showScanner, setShowScanner] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        content: () => receiptRef.current,
        onAfterPrint: () => {
            setShowReceiptModal(false);
            setLastSale(null);
        }
    });

    const {
        items,
        exchangeRate,
        paidUsd,
        paidKhr,
        paymentMethod,
        subtotal,
        grandTotal,
        totalPaid,
        remaining,
        changeUsd,
        changeKhr,
        addItem,
        removeItem,
        updateQuantity,
        setExchangeRate,
        setPaidUsd,
        setPaidKhr,
        setPaymentMethod,
        clearCart,
        getCartData,
    } = useCartStore();

    useEffect(() => {
        loadExchangeRate();
        searchRef.current?.focus();
    }, []);

    const loadExchangeRate = async () => {
        try {
            const res = await exchangeRateApi.getToday();
            setExchangeRate(parseFloat(res.data.data.usd_to_khr));
        } catch (error) {
            toast.error('Failed to load exchange rate');
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const res = await productApi.search(query);
            setSearchResults(res.data.data);
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleProductSelect = async (product: Product) => {
        if (product.is_serialized) {
            setSelectedProduct(product);
            setShowSerialModal(true);
            try {
                const res = await serialApi.getAll({ product_id: product.id, status: 'in_stock' });
                // API returns data as array directly
                setSerialItems(res.data.data || []);
            } catch (error) {
                toast.error('Failed to load serial items');
                setSerialItems([]);
            }
        } else {
            addItem({
                product_id: product.id,
                name: product.name,
                sku: product.sku,
                quantity: 1,
                unit_price: product.selling_price,
                discount: 0,
                is_serialized: false,
            });
            toast.success(`Added ${product.name}`);
        }
        setSearchQuery('');
        setSearchResults([]);
        searchRef.current?.focus();
    };

    const handleSerialSelect = (serial: SerialItem) => {
        // Use selectedProduct for price/sku/id since serial.product only has partial data
        if (!selectedProduct) return;

        addItem({
            product_id: selectedProduct.id,
            serial_item_id: serial.id,
            name: selectedProduct.name,
            sku: selectedProduct.sku,
            imei: serial.imei || serial.serial_number,
            quantity: 1,
            unit_price: selectedProduct.selling_price,
            discount: 0,
            is_serialized: true,
        });
        toast.success(`Added ${selectedProduct.name} - ${serial.imei || serial.serial_number}`);
        setShowSerialModal(false);
        setSelectedProduct(null);
        setSerialItems([]);
        searchRef.current?.focus();
    };

    const handleCheckout = () => {
        if (items.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        if (remaining() > 0.01) {
            toast.error(`Payment insufficient. Remaining: $${Number(remaining()).toFixed(2)}`);
            return;
        }

        setProcessing(true);
        try {
            const cartData = getCartData();
            const res = await saleApi.create(cartData);

            toast.success(`Sale completed! Invoice: ${res.data.data.sale.invoice_number}`);

            // Show change
            const ch = res.data.data.payment.changeMessage;
            if (ch && ch !== 'Exact amount') {
                toast(ch, { icon: '💰', duration: 5000 });
            }

            setLastSale(res.data.data.sale);
            clearCart();
            setShowPaymentModal(false);
            setShowReceiptModal(true);
            searchRef.current?.focus();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-4">
            {/* Products Panel */}
            <div className="flex-1 flex flex-col card">
                {/* Search */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="input pl-11 text-lg"
                                placeholder="Search by name, barcode, or scan IMEI..."
                                autoFocus
                            />
                            {searching && (
                                <FiLoader className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                            )}
                        </div>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="btn btn-primary px-4"
                            title="Scan Barcode/QR"
                        >
                            <FiCamera className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Results - Fixed positioning */}
                    {searchResults.length > 0 && (
                        <div className="absolute z-50 left-4 right-4 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto">
                            {searchResults.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductSelect(product)}
                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800 dark:text-white">{product.name}</p>
                                            <p className="text-sm text-gray-500">{product.sku} • {product.brand?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-600">${product.selling_price}</p>
                                            <p className="text-xs text-gray-500">
                                                {product.is_serialized ? 'Serialized' : `Stock: ${product.available_stock}`}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <FiSearch className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Search and add products to cart</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <CartItemRow
                                    key={item.id}
                                    item={item}
                                    onRemove={() => removeItem(item.id)}
                                    onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Panel */}
            <div className="w-96 flex flex-col card">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Cart Summary</h2>
                    <p className="text-sm text-gray-500">
                        {items.length} item{items.length !== 1 ? 's' : ''} • Rate: ៛{exchangeRate.toLocaleString()}/$
                    </p>
                </div>

                <div className="flex-1 p-4 space-y-4">
                    {/* Totals */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>${Number(subtotal()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-gray-800 dark:text-white pt-2 border-t">
                            <span>Total</span>
                            <span className="text-primary-600">${Number(grandTotal()).toFixed(2)}</span>
                        </div>
                        <div className="text-right text-gray-500">
                            ≈ ៛{(grandTotal() * exchangeRate).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Checkout Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                        className="w-full btn btn-success py-4 text-lg disabled:opacity-50"
                    >
                        <FiDollarSign className="w-5 h-5" />
                        Checkout ${Number(grandTotal()).toFixed(2)}
                    </button>
                </div>
            </div>

            {/* Serial Item Modal */}
            {showSerialModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select IMEI/Serial - {selectedProduct.name}</h3>
                            <button onClick={() => setShowSerialModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <input
                                type="text"
                                value={serialSearch}
                                onChange={(e) => setSerialSearch(e.target.value)}
                                className="input"
                                placeholder="Search IMEI/Serial..."
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 pt-0">
                            {serialItems
                                .filter(s =>
                                    !serialSearch ||
                                    s.imei?.includes(serialSearch) ||
                                    s.serial_number?.includes(serialSearch)
                                )
                                .map((serial) => (
                                    <button
                                        key={serial.id}
                                        onClick={() => handleSerialSelect(serial)}
                                        className="w-full p-3 text-left border rounded-lg mb-2 hover:border-primary-500 hover:bg-primary-50"
                                    >
                                        <p className="font-mono font-medium">{serial.imei || serial.serial_number}</p>
                                    </button>
                                ))}
                            {serialItems.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No items in stock</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    grandTotal={grandTotal()}
                    exchangeRate={exchangeRate}
                    paidUsd={paidUsd}
                    paidKhr={paidKhr}
                    paymentMethod={paymentMethod}
                    totalPaid={totalPaid()}
                    remaining={remaining()}
                    changeUsd={changeUsd()}
                    changeKhr={changeKhr()}
                    onPaidUsdChange={setPaidUsd}
                    onPaidKhrChange={setPaidKhr}
                    onPaymentMethodChange={setPaymentMethod}
                    onConfirm={handlePayment}
                    onCancel={() => setShowPaymentModal(false)}
                    processing={processing}
                />
            )}

            {/* Receipt Modal */}
            {showReceiptModal && lastSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="p-4 border-b flex justify-between items-center text-gray-900 dark:text-white">
                            <h3 className="text-lg font-bold">Sale Successful!</h3>
                            <button onClick={() => setShowReceiptModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg mb-6 text-center">
                                <p className="font-bold text-lg">Invoice #{lastSale.invoice_number}</p>
                                <p className="text-sm">Transaction completed successfully.</p>
                            </div>

                            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30 max-h-96 overflow-y-auto mb-6">
                                <Receipt
                                    ref={receiptRef}
                                    sale={lastSale}
                                    businessInfo={{
                                        name: 'MyShop Phone Store',
                                        address: 'Phnom Penh, Cambodia',
                                        phone: '012 345 678'
                                    }}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handlePrint()}
                                    className="flex-1 btn btn-primary py-3"
                                >
                                    <FiPrinter className="w-5 h-5" />
                                    Print Receipt
                                </button>
                                <button
                                    onClick={() => setShowReceiptModal(false)}
                                    className="flex-1 btn btn-outline py-3"
                                >
                                    New Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Barcode Scanner Modal */}
            {showScanner && (
                <BarcodeScanner
                    onScan={(code) => {
                        setShowScanner(false);
                        handleSearch(code);
                        toast.success(`Scanned: ${code}`);
                    }}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}

function CartItemRow({ item, onRemove, onUpdateQuantity }: {
    item: CartItem;
    onRemove: () => void;
    onUpdateQuantity: (qty: number) => void;
}) {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 dark:text-white truncate">{item.name}</p>
                <p className="text-sm text-gray-500">
                    {item.imei || item.sku} • ${item.unit_price}
                </p>
            </div>

            {!item.is_serialized && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
                        className="p-1 hover:bg-gray-200 rounded"
                    >
                        <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                        onClick={() => onUpdateQuantity(item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                    >
                        <FiPlus className="w-4 h-4" />
                    </button>
                </div>
            )}

            <p className="font-bold text-gray-800 dark:text-white w-20 text-right">
                ${Number(item.total).toFixed(2)}
            </p>

            <button onClick={onRemove} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <FiTrash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

function PaymentModal({
    grandTotal, exchangeRate, paidUsd, paidKhr, paymentMethod,
    totalPaid, remaining, changeUsd, changeKhr,
    onPaidUsdChange, onPaidKhrChange, onPaymentMethodChange,
    onConfirm, onCancel, processing
}: any) {
    const isPaid = remaining < 0.01;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Total */}
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Amount Due</p>
                        <p className="text-4xl font-bold text-primary-600">${Number(grandTotal).toFixed(2)}</p>
                        <p className="text-gray-500">≈ ៛{(grandTotal * exchangeRate).toLocaleString()}</p>
                    </div>

                    {/* Payment Method */}
                    <div className="grid grid-cols-4 gap-2">
                        {['cash', 'card', 'khqr', 'split'].map((method) => (
                            <button
                                key={method}
                                onClick={() => onPaymentMethodChange(method)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${paymentMethod === method
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {method}
                            </button>
                        ))}
                    </div>

                    {/* KHQR Display */}
                    {paymentMethod === 'khqr' && (
                        <div className="flex justify-center py-4">
                            <KHQR
                                amount={grandTotal}
                                currency="USD"
                            />
                        </div>
                    )}

                    {/* Payment Inputs */}
                    {(paymentMethod === 'cash' || paymentMethod === 'split') && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Paid in USD ($)</label>
                                <input
                                    type="number"
                                    value={paidUsd || ''}
                                    onChange={(e) => onPaidUsdChange(parseFloat(e.target.value) || 0)}
                                    className="input text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Paid in KHR (៛)</label>
                                <input
                                    type="number"
                                    value={paidKhr || ''}
                                    onChange={(e) => onPaidKhrChange(parseFloat(e.target.value) || 0)}
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
                            <span className="font-medium">${Number(totalPaid).toFixed(2)}</span>
                        </div>
                        {remaining > 0.01 && (
                            <div className="flex justify-between text-red-600 font-medium">
                                <span>Remaining</span>
                                <span>${Number(remaining).toFixed(2)}</span>
                            </div>
                        )}
                        {isPaid && (changeUsd > 0 || changeKhr > 0) && (
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
                    <button onClick={onCancel} className="flex-1 btn btn-outline">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isPaid || processing}
                        className="flex-1 btn btn-success disabled:opacity-50"
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
    );
}
