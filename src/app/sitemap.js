import BlogPost from '@/models/BlogPost';
import dbConnect from '@/lib/mongodb';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://negints.ir';

    // Static pages
    const routes = [
        '', 
        '/blog', 
        '/products', 
        '/products/kits',
        '/products/instruments',
        '/products/healthcare',
        '/products/pharma',
        '/about'
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : route.startsWith('/products/') ? 0.9 : 0.8,
    }));


    try {
        await dbConnect();
        
        // Dynamic blog posts
        const posts = await BlogPost.find({ status: 'published' })
            .select('slug updatedAt')
            .lean();

        const blogRoutes = posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: 'monthly',
            priority: 0.6,
        }));

        return [...routes, ...blogRoutes];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        return routes; // Return at least static routes if DB fails
    }
}
