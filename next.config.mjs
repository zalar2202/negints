/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    output: "standalone",
    reactCompiler: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 3600,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        localPatterns: [
            {
                pathname: '/api/files/**',
            },
            {
                pathname: '/assets/**',
            },
            {
                pathname: '/uploads/**',
            },
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'negints.com',
            },
            {
                protocol: 'https',
                hostname: 'negints.ir',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            }
        ],
    },
    experimental: {
        // ... experimental options
    },
    async headers() {
        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            img-src 'self' blob: data: https://negints.com https://negints.ir https://www.googletagmanager.com https://www.google-analytics.com;
            font-src 'self' data: https://fonts.gstatic.com;
            object-src 'none';
            base-uri 'self';
            frame-src 'self' https://aparat.com https://www.aparat.com;
            form-action 'self';
            frame-ancestors 'none';
            connect-src 'self' https://www.google-analytics.com https://*.cloudflare.com https://*.cloudflareinsights.com;
            block-all-mixed-content;
            upgrade-insecure-requests;
        `;

        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
    sassOptions: {
        silenceDeprecations: ["import"],
    },
};

export default nextConfig;
