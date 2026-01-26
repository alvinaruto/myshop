'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const { isDarkMode } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    // Only apply theme after component is mounted to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode, mounted]);

    // Avoid flashing white if dark mode is active (can be improved with a script in layout)
    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return <>{children}</>;
};
