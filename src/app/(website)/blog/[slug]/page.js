import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ChevronRight, Share2, Tag, ArrowRight } from "lucide-react";
import WebsiteThemeToggle from "@/components/website/layout/WebsiteThemeToggle";
import { MoveLeft, ChevronLeft } from "lucide-react";
import CommentSection from "@/components/website/CommentSection";
import "@/styles/blog.css";
import dbConnect from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);
    
    if (!post) {
        return {
            title: "پست یافت نشد",
            description: "مقاله مورد نظر پیدا نشد.",
        };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://negints.com";
    
    // Helper to ensure image URLs are absolute for social media crawlers
    const getAbsoluteImageUrl = (url) => {
        if (!url) return `${baseUrl}/assets/logo/negints-logo.png`;
        if (url.startsWith('http')) return url;
        // Ensure leading slash if missing
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    };

    const title = post.seo?.metaTitle || post.title;
    // Robust description fallback: seo field → excerpt → stripped content → title
    const rawDescription = post.seo?.metaDescription 
        || post.excerpt 
        || post.content?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').substring(0, 160).trim();
    const description = (rawDescription && rawDescription.trim()) ? rawDescription.trim() : (post.title || 'این مقاله را در وبلاگ نگین تجهیز سپهر بخوانید');
    const ogImage = getAbsoluteImageUrl(post.seo?.ogImage || post.featuredImage?.url);

    return {
        title: title,
        description: description,
        keywords: post.seo?.metaKeywords?.join(", ") || post.tags?.join(", "),
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `${baseUrl}/blog/${slug}`,
            siteName: "نگین تجهیز سپهر",
            type: "article",
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author?.name],
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: title,
            description: description,
            images: [ogImage],
        },
        robots: {
            index: !post.seo?.noIndex,
            follow: !post.seo?.noFollow,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

async function getPost(slug) {
    try {
        await dbConnect();
        // Remove trailing slash if present
        const cleanSlug = slug.endsWith('/') ? slug.slice(0, -1) : slug;
        // Decode in case the slug arrives URL-encoded
        const decodedSlug = decodeURIComponent(cleanSlug);
        
        const post = await BlogPost.findOne({ slug: decodedSlug, status: 'published' })
            .populate('author', 'name avatar bio')
            .populate('category', 'name slug color')
            .lean();
        
        if (!post) return null;
        
        // Increment view count in background (non-blocking)
        BlogPost.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } }).catch(() => {});
        
        // Serialize for JSON (convert ObjectId and Date)
        return JSON.parse(JSON.stringify(post));
    } catch (error) {
        console.error("Failed to fetch post:", error);
        return null;
    }
}

async function getRelatedPosts(categoryId, currentPostId) {
    if (!categoryId) return [];
    
    try {
        await dbConnect();
        const posts = await BlogPost.find({
            category: categoryId,
            status: 'published',
            _id: { $ne: currentPostId },
        })
            .populate('author', 'name avatar')
            .populate('category', 'name slug color')
            .sort({ publishedAt: -1 })
            .limit(3)
            .lean();
        
        return JSON.parse(JSON.stringify(posts));
    } catch (error) {
        console.error("Failed to fetch related posts:", error);
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

function ShareButton({ title, url }) {
    return (
        <button
            onClick={() => {
                if (navigator.share) {
                    navigator.share({ title, url });
                } else {
                    navigator.clipboard.writeText(url);
                }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] transition-colors"
        >
            <Share2 size={16} />
            اشتراک‌گذاری
        </button>
    );
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(
        post.category?._id || post.category,
        post._id
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://negints.ir";
    const postUrl = `${baseUrl}/blog/${post.slug}`;
    
    // Normalize image URLs: strip domain to make relative, so Next.js Image works correctly
    const normalizeImageUrl = (url) => {
        if (!url) return null;
        // If it's an absolute URL, extract just the path
        if (url.startsWith('http')) {
            try {
                const parsed = new URL(url);
                return parsed.pathname + parsed.search;
            } catch {
                return url;
            }
        }
        return url.startsWith('/') ? url : `/${url}`;
    };

    const displayImageUrl = normalizeImageUrl(post.featuredImage?.url);
    
    // For metadata/schema (needs full absolute URL)
    const imageUrl = post.featuredImage?.url 
        ? `${baseUrl}${normalizeImageUrl(post.featuredImage.url)}`
        : `${baseUrl}/assets/logo/negints-logo.png`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": imageUrl,
        "author": {
            "@type": "Person",
            "name": post.author?.name || "NeginTS Team",
        },
        "publisher": {
            "@type": "Organization",
            "name": "NeginTS",
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/assets/logo/negints-logo.png`
            }
        },
        "datePublished": post.publishedAt,
        "dateModified": post.updatedAt,
        "description": post.seo?.metaDescription || post.excerpt || post.title,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": postUrl
        }
    };

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
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": {
                    "@type": "WebPage",
                    "@id": postUrl,
                    "name": post.title
                }
            }
        ]
    };

    return (
        <article key={post.slug} className="min-h-screen pt-32 md:pt-40 bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors duration-300" dir="rtl">
            {/* Breadcrumb JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {/* Default JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* Custom/FAQ JSON-LD Schema */}
            {post.seo?.schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ 
                        __html: (() => {
                            try {
                                const cleaned = post.seo.schema.replace(/<\/?script[^>]*>/gi, "");
                                const json = JSON.parse(cleaned);
                                // Add name if missing to avoid "Unnamed item" in GSC
                                if (!json.name) {
                                    json.name = `${post.title} FAQ`;
                                }
                                return JSON.stringify(json);
                            } catch (e) {
                                return post.seo.schema.replace(/<\/?script[^>]*>/gi, "");
                            }
                        })()
                    }}
                />
            )}

            {/* Hero Section */}
            <section className="relative">
                {/* Featured Image */}
                {displayImageUrl ? (
                    <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={displayImageUrl}
                            alt={post.featuredImage?.alt || post.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="eager"
                            fetchPriority="high"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>
                ) : (
                    <div className="h-[40vh] bg-gradient-to-br from-[var(--accent-color)] to-purple-600" />
                )}

                {/* Top Navigation Overlay */}
                <div className="absolute top-0 left-0 right-0 px-4 pt-10 z-20">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                        >
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            بازگشت به وبلاگ
                        </Link>
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-12 z-10">
                    <div className="max-w-4xl mx-auto text-white text-right">
                        {/* Category */}
                        {post.category && (
                            <div className="mb-4">
                                <Link
                                    href={`/blog/category/${post.category.slug}`}
                                    className="inline-block px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm hover:brightness-110 transition-all"
                                    style={{ backgroundColor: `${post.category.color}CC` }}
                                >
                                    {post.category.name}
                                </Link>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            {post.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-white/80">
                            {post.author && post.showAuthor !== false && (
                                <div className="flex items-center gap-2" dir="rtl">
                                    {post.author.avatar ? (
                                        <img
                                            key={`${post.author.name}-avatar`}
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            className="w-8 h-8 rounded-full"
                                            loading="eager"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                            <User size={16} />
                                        </div>
                                    )}
                                    <span>{post.author.name}</span>
                                </div>
                            )}
                            <span className="flex items-center gap-1" dir="rtl">
                                <Calendar size={14} />
                                {formatDate(post.publishedAt)}
                            </span>
                            <span className="flex items-center gap-1" dir="rtl">
                                <Clock size={14} />
                                <span>{post.readingTime || 1} دقیقه مطالعه</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 px-4 relative z-0">
                <div className="max-w-4xl mx-auto">
                    <div className="lg:flex lg:gap-12">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Article Content */}
                            <div
                                className="prose prose-lg max-w-none blog-content dark:prose-invert text-right
                                    prose-headings:text-[var(--color-text-primary)]
                                    prose-p:text-[var(--color-text-secondary)]
                                    prose-a:text-[var(--color-primary)]
                                    prose-strong:text-[var(--color-text-primary)]
                                    prose-blockquote:border-[var(--color-primary)]
                                    prose-blockquote:text-[var(--color-text-secondary)]
                                    prose-pre:bg-[var(--color-background-tertiary)]"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-[var(--border-color)] text-right">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Tag size={18} className="text-[var(--text-secondary)]" />
                                        {post.tags.map((tag) => (
                                            <Link
                                                key={tag}
                                                href={`/blog/tag/${tag}`}
                                                className="px-3 py-1 text-sm rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--accent-color)] hover:text-white transition-colors"
                                            >
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Author Bio */}
                            {post.author && post.author.bio && post.showAuthor !== false && (
                                <div className="mt-12 p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] text-right">
                                    <div className="flex items-start gap-4">
                                        {post.author.avatar ? (
                                            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                                                <Image
                                                    src={post.author.avatar}
                                                    alt={post.author.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                                                <User size={24} className="text-[var(--text-secondary)]" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)]">
                                                {post.author.name}
                                            </h4>
                                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                                {post.author.bio}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            <CommentSection 
                                entityId={post._id}
                                apiPath={`/api/blog/posts/${post._id}/comments`}
                                allowComments={post.allowComments !== false} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="py-12 px-4 bg-[var(--bg-secondary)]" dir="rtl">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-right">
                            مطالب مرتبط
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost._id}
                                    href={`/blog/${relatedPost.slug}`}
                                    className="group block overflow-hidden rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all duration-300"
                                >
                                    <div className="h-40 overflow-hidden relative">
                                        {relatedPost.featuredImage?.url ? (
                                            <Image
                                                key={relatedPost._id}
                                                src={relatedPost.featuredImage.url}
                                                alt={relatedPost.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[var(--accent-color)] to-purple-600" />
                                        )}
                                    </div>
                                    <div className="p-4 text-right">
                                        <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors line-clamp-2">
                                            {relatedPost.title}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)] mt-2">
                                            {formatDate(relatedPost.publishedAt)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Navigation */}
            <section className="py-8 px-4 border-t border-[var(--border-color)]">
                <div className="max-w-4xl mx-auto flex justify-between">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
                    >
                        <ArrowRight size={18} />
                        بازگشت به وبلاگ
                    </Link>
                </div>
            </section>
        </article>
    );
}
