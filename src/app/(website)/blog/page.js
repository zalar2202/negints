import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ChevronLeft, Tag } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import BlogCategory from "@/models/BlogCategory";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "وبلاگ تخصصی | نگین تجهیز سپهر",
    description: "آخرین مقالات، آموزش‌ها و تازه‌های دنیای تجهیزات پزشکی و مهندسی پزشکی را در وبلاگ نگین تجهیز سپهر دنبال کنید.",
    openGraph: {
        title: "وبلاگ | نگین تجهیز سپهر",
        description: "آخرین مقالات و آموزش‌های تخصصی تجهیزات پزشکی.",
        type: "website",
        images: [
            {
                url: "/assets/logo/negints-logo.png",
                width: 512,
                height: 512,
                alt: "NeginTS Logo",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "وبلاگ | نگین تجهیز سپهر",
        description: "آخرین مقالات تخصصی تجهیزات پزشکی.",
        images: ["/assets/logo/negints-logo.png"],
    },
    alternates: {
        canonical: "/blog",
    },
};

async function getPosts() {
    try {
        await dbConnect();
        const posts = await BlogPost.find({ status: 'published' })
            .populate('author', 'name avatar')
            .populate('category', 'name slug color')
            .sort({ isPinned: -1, publishedAt: -1 })
            .limit(12)
            .lean();
        
        return { posts: JSON.parse(JSON.stringify(posts)) };
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return { posts: [] };
    }
}

async function getCategories() {
    try {
        await dbConnect();
        const categories = await BlogCategory.find({ isActive: true })
            .sort({ order: 1, name: 1 })
            .lean();
        
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fa-IR", {
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

function PostCard({ post, featured = false }) {
    const imgUrl = normalizeImageUrl(post.featuredImage?.url);
    return (
        <Link
            href={`/blog/${post.slug}`}
            className={`group block overflow-hidden rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                featured ? "md:col-span-2 md:row-span-2" : ""
            }`}
        >
            {/* Featured Image */}
            <div
                className={`relative overflow-hidden ${
                    featured ? "h-64 md:h-80" : "h-48"
                }`}
            >
                {imgUrl ? (
                    <Image
                        src={imgUrl}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                        <span className="text-white/50 text-6xl font-bold">
                            {post.title.charAt(0)}
                        </span>
                    </div>
                )}
                {/* Category Badge */}
                {post.category && (
                    <span
                        className="absolute top-4 right-4 px-3 py-1 text-sm font-bold rounded-full text-white backdrop-blur-sm shadow-sm"
                        style={{ backgroundColor: `${post.category.color || 'var(--color-primary)'}CC` }}
                    >
                        {post.category.name}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-6 text-right">
                <h3
                    className={`font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-tight ${
                        featured ? "text-2xl" : "text-lg"
                    }`}
                >
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p
                        className={`mt-3 text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed ${
                            featured ? "text-base" : "text-sm"
                        }`}
                    >
                        {post.excerpt}
                    </p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 mt-5 text-xs font-medium text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-[var(--color-primary)]" />
                        {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={14} className="text-[var(--color-primary)]" />
                        {post.readingTime} دقیقه مطالعه
                    </span>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-[10px] font-bold rounded-md bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

export default async function BlogPage() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://negints.ir";
    const [{ posts, pagination }, categories] = await Promise.all([
        getPosts(),
        getCategories(),
    ]);

    const featuredPost = posts.find((p) => p.isFeatured);
    const regularPosts = posts.filter((p) => p._id !== featuredPost?._id);

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "خانه",
                "item": {
                    "@type": "WebPage",
                    "@id": baseUrl,
                    "name": "نگین تجهیز سپهر"
                }
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "وبلاگ",
                "item": {
                    "@type": "WebPage",
                    "@id": `${baseUrl}/blog`,
                    "name": "وبلاگ"
                }
            }
        ]
    };

    return (
        <main className="min-h-screen py-24 px-4 bg-[var(--color-background)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <section className="text-center mb-20">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-text-primary)] mb-6">
                        وبلاگ تخصصی{" "}
                        <span className="bg-gradient-to-l from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                            نگین تجهیز
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed font-medium">
                        آخرین مقالات، آموزش‌ها و تحلیل‌های تخصصی در حوزه تجهیزات پزشکی،
                        استانداردهای نوین و راهکارهای مهندسی سلامت.
                    </p>
                </section>

                {/* Categories */}
                {categories.length > 0 && (
                    <section className="mb-16">
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/blog"
                                className="px-6 py-2.5 rounded-full text-sm font-bold bg-[var(--color-primary)] text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
                            >
                                همه مقالات
                            </Link>
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    href={`/blog/category/${category.slug}`}
                                    className="px-6 py-2.5 rounded-full text-sm font-bold border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all bg-[var(--color-background-elevated)]"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Posts Grid */}
                {posts.length > 0 ? (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredPost && (
                            <PostCard post={featuredPost} featured />
                        )}
                        {regularPosts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </section>
                ) : (
                    <div className="text-center py-24 bg-[var(--color-background-secondary)] rounded-3xl border-2 border-dashed border-[var(--color-border)]">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-[var(--color-background-elevated)] flex items-center justify-center shadow-inner">
                            <Tag size={40} className="text-[var(--color-text-tertiary)]" />
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-3">
                            هنوز مقاله‌ای منتشر نشده است
                        </h2>
                        <p className="text-[var(--color-text-secondary)] font-medium">
                            تیم تحریریه ما در حال آماده‌سازی مطالب ارزشمندی برای شماست. به‌زودی برگردید!
                        </p>
                    </div>
                )}

                {/* Load More / Pagination */}
                {pagination && pagination.pages > 1 && (
                    <section className="flex justify-center mt-20">
                        <Link
                            href="/blog?page=2"
                            className="negints-alt-btn group"
                        >
                            مشاهده مقالات بیشتر
                            <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        </Link>
                    </section>
                )}
            </div>
        </main>
    );
}

