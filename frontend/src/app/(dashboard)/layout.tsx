'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { FiHome, FiShoppingCart, FiPackage, FiUsers, FiBarChart2, FiSettings, FiLogOut, FiMenu, FiX, FiSmartphone, FiDollarSign, FiShield, FiBell, FiAlertCircle, FiCoffee } from 'react-icons/fi';
import { productApi } from '@/lib/api';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardLayoutProps {
    children: ReactNode;
}

interface NavItem {
    name: string;
    href: string;
    icon: any;
    roles: string[];
    badgeKey?: 'pendingOrders';
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome, roles: ['admin', 'manager'] },
    { name: 'Phone Shop POS', href: '/pos', icon: FiShoppingCart, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Café POS', href: '/cafe', icon: FiCoffee, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Kitchen Display', href: '/cafe/kitchen', icon: FiCoffee, roles: ['admin', 'manager', 'cashier'], badgeKey: 'pendingOrders' },
    { name: 'Order Queue', href: '/cafe/queue', icon: FiCoffee, roles: ['admin', 'manager', 'cashier'], badgeKey: 'pendingOrders' },
    { name: 'Café Menu', href: '/cafe/menu', icon: FiCoffee, roles: ['admin', 'manager'] },
    { name: 'Café Sales', href: '/cafe/sales', icon: FiDollarSign, roles: ['admin', 'manager'] },
    { name: 'Café Reports', href: '/cafe/reports', icon: FiBarChart2, roles: ['admin', 'manager'] },
    { name: 'Shift Management', href: '/cafe/shift', icon: FiCoffee, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Tables', href: '/cafe/tables', icon: FiCoffee, roles: ['admin', 'manager'] },
    { name: 'Promotions', href: '/cafe/promotions', icon: FiCoffee, roles: ['admin', 'manager'] },
    { name: 'Ingredients', href: '/cafe/ingredients', icon: FiPackage, roles: ['admin', 'manager'] },
    { name: 'Inventory', href: '/inventory', icon: FiPackage, roles: ['admin', 'manager'] },
    { name: 'Sales History', href: '/sales', icon: FiDollarSign, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Reports', href: '/reports', icon: FiBarChart2, roles: ['admin', 'manager'] },
    { name: 'Warranty Tracker', href: '/warranty', icon: FiShield, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Users', href: '/users', icon: FiUsers, roles: ['admin'] },
    { name: 'Settings', href: '/settings', icon: FiSettings, roles: ['admin', 'manager'] },
    { name: 'Customer Menu', href: '/menu', icon: FiCoffee, roles: ['admin', 'manager', 'cashier'] },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [pendingOrderCount, setPendingOrderCount] = useState(0);

    useEffect(() => {
        setIsMounted(true);
        if (isAuthenticated) {
            fetchLowStock();
            fetchPendingOrders();
            // Poll for pending orders every 30 seconds
            const interval = setInterval(fetchPendingOrders, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchPendingOrders = async () => {
        try {
            const res = await fetch('/api/cafe/orders?status=pending,preparing&limit=100');
            const data = await res.json();
            if (data.success) {
                setPendingOrderCount(data.data?.length || 0);
            }
        } catch (error) {
            console.error('Failed to fetch pending orders');
        }
    };

    const fetchLowStock = async () => {
        try {
            const res = await productApi.getLowStock();
            const { accessories, devices } = res.data.data;
            const combined = [...accessories, ...devices];
            setLowStockItems(combined);
            setLowStockCount(combined.length);
        } catch (error) {
            console.error('Failed to fetch low stock alerts');
        }
    };

    const getBadgeCount = (badgeKey?: string): number => {
        if (badgeKey === 'pendingOrders') return pendingOrderCount;
        return 0;
    };

    useEffect(() => {
        // Only redirect if we ARE mounted AND hydration finished AND we're still not authenticated
        if (isMounted && _hasHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isMounted, _hasHydrated, router]);

    // Enhanced loading state to handle hydration and protected access
    if (!isMounted || !_hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect via useEffect
    }

    const filteredNavigation = navigation.filter((item) =>
        item.roles.includes(user.role)
    );

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Fixed with flex column for proper scrolling */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo - Fixed height header */}
                <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                            <FiSmartphone className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">MyShop</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation - Scrollable area */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {filteredNavigation.map((item) => {
                        // For /cafe, only match exactly (not /cafe/menu, /cafe/ingredients)
                        const isExactMatch = pathname === item.href;
                        const isChildMatch = item.href !== '/cafe' && pathname?.startsWith(item.href + '/');
                        const isActive = isExactMatch || isChildMatch;
                        const badgeCount = getBadgeCount(item.badgeKey);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm ${isActive
                                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="truncate flex-1">{item.name}</span>
                                {badgeCount > 0 && (
                                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full min-w-[20px] text-center">
                                        {badgeCount > 99 ? '99+' : badgeCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User info - Fixed height footer */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                {user.full_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {user.role}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-3 sm:px-4 lg:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1 sm:gap-2">
                        <ThemeToggle />

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors"
                            >
                                <FiBell className="w-5 h-5 sm:w-6 sm:h-6" />
                                {lowStockCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
                                        {lowStockCount > 9 ? '9+' : lowStockCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                                        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Inventory Alerts</h4>
                                        </div>
                                        <div className="max-h-72 sm:max-h-96 overflow-y-auto">
                                            {lowStockItems.length === 0 ? (
                                                <div className="p-6 sm:p-8 text-center text-gray-500">
                                                    <FiBell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-sm italic">No new alerts</p>
                                                </div>
                                            ) : (
                                                lowStockItems.map((item) => (
                                                    <Link
                                                        key={item.id}
                                                        href="/inventory"
                                                        onClick={() => setShowNotifications(false)}
                                                        className="flex items-start gap-3 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-50 dark:border-gray-700 last:border-0 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex-shrink-0 flex items-center justify-center text-red-600">
                                                            <FiAlertCircle className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                                                            <p className="text-xs text-red-600 font-bold mt-0.5">
                                                                Low stock: {item.quantity || item.available_stock} left
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider truncate">{item.sku}</p>
                                                        </div>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                        {lowStockItems.length > 0 && (
                                            <Link
                                                href="/inventory"
                                                className="block p-3 text-center text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 uppercase tracking-widest border-t border-gray-100 dark:border-gray-700 transition-colors"
                                                onClick={() => setShowNotifications(false)}
                                            >
                                                Manage Inventory
                                            </Link>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick info - Hide on very small screens */}
                    <div className="hidden sm:flex items-center gap-4 ml-2">
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Today&apos;s Date</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-3 sm:p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}
