export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://negints.com';

    
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/panel/', '/api/'], // Hide admin and api from search engines
                allow: ['/api/files', '/api/blog/'], // Allow images and blog content fetching
            },
            {
                userAgent: ['GPTBot', 'ClaudeBot', 'Applebot-Extended'],
                allow: '/',
            },
            {
                userAgent: [
                    'Amazonbot',
                    'Bytespider',
                    'CCBot',
                    'Google-Extended',
                    'meta-externalagent'
                ],
                disallow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
