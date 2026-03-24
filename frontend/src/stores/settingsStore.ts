import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BusinessInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
    receiptMessage?: string;
}

interface SettingsState {
    businessInfo: BusinessInfo;
    updateBusinessInfo: (info: Partial<BusinessInfo>) => void;
}

const defaultBusiness: BusinessInfo = {
    name: 'MyShop Phone Store',
    address: 'Phnom Penh, Cambodia',
    phone: '012 345 678',
    email: 'contact@myshop.com',
    website: 'www.myshop.com',
    receiptMessage: 'Thank you for shopping with us!',
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            businessInfo: defaultBusiness,
            updateBusinessInfo: (info) =>
                set((state) => ({
                    businessInfo: { ...state.businessInfo, ...info },
                })),
        }),
        {
            name: 'app-settings',
        }
    )
);
