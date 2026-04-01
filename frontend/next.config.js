/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
        ],
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/frontend/api/:path*',
                    destination: '/api/:path*',
                }
            ],
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
