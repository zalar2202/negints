import { NextResponse } from 'next/server';
import BlogPost from '@/models/BlogPost';
import BlogCategory from '@/models/BlogCategory';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

/**
 * GET /api/blog/posts
 * 
 * Fetch blog posts with filtering, pagination, and search.
 * Public endpoint for published posts, admin sees all.
 */
export async function GET(request) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured');
        const admin = searchParams.get('admin') === 'true';
        
        const skip = (page - 1) * limit;
        
        // Build query
        let query = {};
        
        // Check if admin request
        let isAdmin = false;
        if (admin) {
            const user = await verifyAuth(request);
            isAdmin = user && ['admin', 'manager'].includes(user.role);
        }
        
        // Non-admin users can only see published posts
        if (!isAdmin) {
            query.status = 'published';
            query.publishedAt = { $lte: new Date() };
        } else if (status) {
            query.status = status;
        }
        
        // Category filter
        if (category) {
            const isId = category.match(/^[0-9a-fA-F]{24}$/);
            if (isId) {
                query.category = category;
            } else {
                const categoryDoc = await BlogCategory.findOne({ slug: category });
                if (categoryDoc) {
                    query.category = categoryDoc._id;
                }
            }
        }
        
        // Tag filter
        if (tag) {
            query.tags = tag.toLowerCase();
        }
        
        // Featured filter
        if (featured === 'true') {
            query.isFeatured = true;
        }
        
        // Search
        if (search) {
            query.$text = { $search: search };
        }
        
        // Execute query
        const [posts, total] = await Promise.all([
            BlogPost.find(query)
                .populate('author', 'name avatar')
                .populate('category', 'name slug color')
                .sort({ isPinned: -1, publishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            BlogPost.countDocuments(query),
        ]);
        
        return NextResponse.json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Blog posts GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch posts' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/blog/posts
 * 
 * Create a new blog post. Admin/Manager only.
 */
export async function POST(request) {
    try {
        await dbConnect();
        
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const body = await request.json();
        const { title, content, excerpt, category, tags, status, seo, featuredImage, isFeatured, scheduledFor, allowComments } = body;
        
        // Validate required fields
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }
        
        // Generate slug
        const slug = await BlogPost.generateSlug(title);
        
        // Create post
        const post = new BlogPost({
            title,
            slug,
            content,
            excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
            category: category || null,
            tags: tags || [],
            status: status || 'draft',
            author: user._id,
            seo: {
                metaTitle: seo?.metaTitle || title,
                metaDescription: seo?.metaDescription || excerpt || content.replace(/<[^>]*>/g, '').substring(0, 160),
                metaKeywords: seo?.metaKeywords || tags || [],
                ogImage: seo?.ogImage || featuredImage?.url || null,
                noIndex: seo?.noIndex || false,
                noFollow: seo?.noFollow || false,
            },
            featuredImage: featuredImage || null,
            isFeatured: isFeatured || false,
            scheduledFor: scheduledFor || null,
            allowComments: allowComments !== false,
        });
        
        // Set publishedAt if publishing immediately
        if (status === 'published') {
            post.publishedAt = new Date();
        }
        
        await post.save();
        
        // Update category post count
        if (category) {
            await BlogCategory.updatePostCount(category);
        }
        
        // Populate for response
        await post.populate('author', 'name avatar');
        await post.populate('category', 'name slug color');
        
        return NextResponse.json({
            success: true,
            data: post,
            message: 'Post created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Blog post CREATE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create post' },
            { status: 500 }
        );
    }
}
