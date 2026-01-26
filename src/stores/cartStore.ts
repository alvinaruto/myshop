import { create } from 'zustand';

export interface CartItem {
    id: string;
    product_id: string;
    serial_item_id?: string;
    name: string;
    sku: string;
    imei?: string;
    quantity: number;
    unit_price: number;
    discount: number;
    total: number;
    is_serialized: boolean;
}

interface CartState {
    items: CartItem[];
    exchangeRate: number;
    paidUsd: number;
    paidKhr: number;
    paymentMethod: 'cash' | 'card' | 'khqr' | 'split';
    customerId?: string;
    notes: string;

    // Calculated values
    subtotal: () => number;
    totalDiscount: () => number;
    grandTotal: () => number;
    paidKhrInUsd: () => number;
    totalPaid: () => number;
    remaining: () => number;
    changeUsd: () => number;
    changeKhr: () => number;

    // Actions
    addItem: (item: Omit<CartItem, 'id' | 'total'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateDiscount: (id: string, discount: number) => void;
    setExchangeRate: (rate: number) => void;
    setPaidUsd: (amount: number) => void;
    setPaidKhr: (amount: number) => void;
    setPaymentMethod: (method: CartState['paymentMethod']) => void;
    setCustomerId: (id?: string) => void;
    setNotes: (notes: string) => void;
    clearCart: () => void;
    getCartData: () => any;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    exchangeRate: 4100,
    paidUsd: 0,
    paidKhr: 0,
    paymentMethod: 'cash',
    customerId: undefined,
    notes: '',

    subtotal: () => get().items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),

    totalDiscount: () => get().items.reduce((sum, item) => sum + item.discount, 0),

    grandTotal: () => get().subtotal() - get().totalDiscount(),

    paidKhrInUsd: () => get().paidKhr / get().exchangeRate,

    totalPaid: () => get().paidUsd + get().paidKhrInUsd(),

    remaining: () => Math.max(0, get().grandTotal() - get().totalPaid()),

    changeUsd: () => {
        const overpaid = get().totalPaid() - get().grandTotal();
        if (overpaid <= 0) return 0;
        return overpaid >= 20 ? Math.floor(overpaid) : 0;
    },

    changeKhr: () => {
        const overpaid = get().totalPaid() - get().grandTotal();
        if (overpaid <= 0) return 0;
        const changeUsd = get().changeUsd();
        const remainderUsd = overpaid - changeUsd;
        return Math.round(remainderUsd * get().exchangeRate / 100) * 100; // Round to nearest 100
    },

    addItem: (item) => {
        const { items } = get();

        // Check if non-serialized item already in cart
        if (!item.is_serialized) {
            const existing = items.find(i => i.product_id === item.product_id);
            if (existing) {
                set({
                    items: items.map(i =>
                        i.product_id === item.product_id
                            ? {
                                ...i,
                                quantity: i.quantity + item.quantity,
                                total: (i.quantity + item.quantity) * i.unit_price - i.discount
                            }
                            : i
                    ),
                });
                return;
            }
        }

        const newItem: CartItem = {
            ...item,
            id: `${item.product_id}-${Date.now()}`,
            total: item.unit_price * item.quantity - item.discount,
        };

        set({ items: [...items, newItem] });
    },

    removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
    },

    updateQuantity: (id, quantity) => {
        set({
            items: get().items.map(item =>
                item.id === id
                    ? { ...item, quantity, total: item.unit_price * quantity - item.discount }
                    : item
            ),
        });
    },

    updateDiscount: (id, discount) => {
        set({
            items: get().items.map(item =>
                item.id === id
                    ? { ...item, discount, total: item.unit_price * item.quantity - discount }
                    : item
            ),
        });
    },

    setExchangeRate: (rate) => set({ exchangeRate: rate }),
    setPaidUsd: (amount) => set({ paidUsd: amount }),
    setPaidKhr: (amount) => set({ paidKhr: amount }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setCustomerId: (id) => set({ customerId: id }),
    setNotes: (notes) => set({ notes }),

    clearCart: () => set({
        items: [],
        paidUsd: 0,
        paidKhr: 0,
        paymentMethod: 'cash',
        customerId: undefined,
        notes: '',
    }),

    getCartData: () => {
        const state = get();
        return {
            items: state.items.map(item => ({
                product_id: item.product_id,
                serial_item_id: item.serial_item_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount,
            })),
            customer_id: state.customerId,
            payment_method: state.paymentMethod,
            paid_usd: state.paidUsd,
            paid_khr: state.paidKhr,
            discount_usd: state.totalDiscount(),
            notes: state.notes,
        };
    },
}));
