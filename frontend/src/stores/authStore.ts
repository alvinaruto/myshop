import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    id: string;
    username: string;
    full_name: string;
    role: 'admin' | 'manager' | 'cashier';
    is_active: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    canViewCostPrice: () => boolean;
    canEditStock: () => boolean;
    canDeleteSales: () => boolean;
    canAccessReports: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                set({ user, token, isAuthenticated: true });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
            },

            canViewCostPrice: () => {
                const { user } = get();
                return user?.role === 'admin' || user?.role === 'manager';
            },

            canEditStock: () => {
                const { user } = get();
                return user?.role === 'admin' || user?.role === 'manager';
            },

            canDeleteSales: () => {
                const { user } = get();
                return user?.role === 'admin';
            },

            canAccessReports: () => {
                const { user } = get();
                return user?.role === 'admin' || user?.role === 'manager';
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
