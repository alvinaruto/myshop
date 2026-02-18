/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b'
                },
                espresso: {
                    DEFAULT: '#1a0f0a',
                    light: '#2d1b12',
                    dark: '#0e0805',
                },
                gold: {
                    DEFAULT: '#c19a6b',
                    light: '#d4b794',
                    dark: '#a87d42',
                },
                cream: {
                    DEFAULT: '#f5f5dc',
                    light: '#fafaf0',
                    dark: '#ebebd0',
                },
                success: {
                    500: '#22c55e',
                    600: '#16a34a'
                },
                warning: {
                    500: '#f59e0b',
                    600: '#d97706'
                },
                danger: {
                    500: '#ef4444',
                    600: '#dc2626'
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'Inter', 'Kantumruy Pro', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
                khmer: ['Kantumruy Pro', 'Noto Sans Khmer', 'sans-serif']
            }
        },
    },
    plugins: [],
};
