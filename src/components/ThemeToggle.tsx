'use client';

import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '@/stores/themeStore';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
    const { isDarkMode, toggleDarkMode } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 w-10 h-10" />;
    }

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {isDarkMode ? (
                <FiSun className="w-6 h-6" />
            ) : (
                <FiMoon className="w-6 h-6" />
            )}
        </button>
    );
};
