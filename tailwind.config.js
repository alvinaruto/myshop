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
                sans: ['Inter', 'Kantumruy Pro', 'sans-serif'],
                khmer: ['Kantumruy Pro', 'Noto Sans Khmer', 'sans-serif']
            }
        },
    },
    plugins: [],
};
