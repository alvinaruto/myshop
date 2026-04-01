import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { Inter, Montserrat, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

const montserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-montserrat',
    weight: ['300', '400', '500', '600', '700'],
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-playfair',
    weight: ['400', '700', '900'],
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export const metadata: Metadata = {
    title: 'MyShop POS - Phone Shop Management System',
    description: 'Complete phone shop management and POS system for Cambodia',
};

import { ThemeProvider } from '@/components/ThemeProvider';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var storage = localStorage.getItem('theme-storage');
                                    var isDark = false;
                                    if (storage) {
                                        var data = JSON.parse(storage);
                                        isDark = data.state.isDarkMode;
                                    }
                                    if (isDark) {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${inter.variable} ${montserrat.variable} ${playfair.variable}`}>
                <ThemeProvider>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#1f2937',
                                color: '#f9fafb',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#22c55e',
                                    secondary: '#f9fafb',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#f9fafb',
                                },
                            },
                        }}
                    />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
