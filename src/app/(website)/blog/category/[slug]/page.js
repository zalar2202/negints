import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, ChevronRight, Hash } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import BlogCategory from "@/models/BlogCategory";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        return {
            title: "Category Not Found | NeginTS",
        };
    }

    return {
        title: category.seo?.metaTitle || `${category.name} | NeginTS Blog`,
        description: category.seo?.metaDescription || category.description || `Articles in the ${category.name} category.`,
        alternates: {
            canonical: `/blog/category/${slug}`,
        },
        openGraph: {
            title: category.seo?.metaTitle || `${category.name} | NeginTS Blog`,
            description: category.seo?.metaDescription || category.description || `Articles in the ${category.name} category.`,
            type: "website",
        },
    };
}

async function getCategory(slug) {
    try {
        await dbConnect();
        const decodedSlug = decodeURIComponent(slug);
        const category = await BlogCategory.findOne({ slug: decodedSlug, isActive: true }).lean();
        if (!category) return null;
        return JSON.parse(JSON.stringify(category));
    } catch (error) {
        return null;
    }
}

async function getPostsByCategory(categoryId) {
    try {
        await dbConnect();
        const posts = await BlogPost.find({
            category: categoryId,
            status: 'published',
        })
            .populate('author', 'name avatar')
            .populate('category', 'name slug color')
            .sort({ publishedAt: -1 })
            .limit(12)
            .lean();
        
        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        return [];
    }
}

function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function normalizeImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) {
        try {
            const parsed = new URL(url);
            return parsed.pathname + parsed.search;
        } catch {
            return url;
        }
    }
    return url.startsWith('/') ? url : `/${url}`;
}

function PostCard({ post }) {
    const imgUrl = normalizeImageUrl(post.featuredImage?.url);
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group block overflow-hidden rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <div className="relative h-48 overflow-hidden">
                {imgUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={imgUrl}
                        alt={post.featuredImage.alt || post.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center">
                        <span className="text-white/50 text-6xl font-bold">
                            {post.title.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors line-clamp-2">
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                        {post.excerpt}
                    </p>
                )}

                <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readingTime} min read
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const category = await getCategory(slug);

    if (!category) {
        notFound();
    }

    const posts = await getPostsByCategory(category._id);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://negints.com";
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": {
                    "@type": "WebPage",
                    "@id": baseUrl,
                    "name": "NeginTS"
                }
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": {
                    "@type": "WebPage",
                    "@id": `${baseUrl}/blog`,
                    "name": "Blog"
                }
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": category.name,
                "item": {
                    "@type": "WebPage",
                    "@id": `${baseUrl}/blog/category/${slug}`,
                    "name": category.name
                }
            }
        ]
    };

    return (
        <main className="min-h-screen py-20 px-4">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] mb-6 transition-colors"
                    >
                        <ChevronRight size={18} className="rotate-180" />
                        Back to Blog
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: category.color }}
                        >
                            <Hash size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                                {category.name}
                            </h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
                            </p>
                        </div>
                    </div>

                    {category.description && (
                        <p className="mt-6 text-lg text-[var(--text-secondary)] max-w-3xl">
                            {category.description}
                        </p>
                    )}
                </div>

                {/* Posts Grid */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                        <h2 className="text-xl font-medium text-[var(--text-secondary)]">
                            No articles found in this category yet.
                        </h2>
                        <Link
                            href="/blog"
                            className="inline-block mt-4 text-[var(--accent-color)] hover:underline"
                        >
                            Explore other categories
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
