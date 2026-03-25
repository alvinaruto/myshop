/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    },
    async rewrites() {
        return {
            // Fallback rewrites run AFTER all pages/API routes in the filesystem
            // This sends non-Next.js API requests to the Express backend
            fallback: [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:4000/api/:path*',
                },
            ],
        };
    },
};

module.exports = nextConfig;
