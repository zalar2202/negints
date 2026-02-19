import { NextResponse } from 'next/server';
import BlogPost from '@/models/BlogPost';
import BlogCategory from '@/models/BlogCategory';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

/**
 * GET /api/blog/posts/[id]
 * 
 * Fetch a single blog post by ID or slug.
 * Public for published posts, admin sees all.
 */
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);
        
        let post;
        if (isSlug) {
            post = await BlogPost.findOne({ slug: id })
                .populate('author', 'name avatar bio')
                .populate('category', 'name slug color');
        } else {
            post = await BlogPost.findById(id)
                .populate('author', 'name avatar bio')
                .populate('category', 'name slug color');
        }
        
        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }
        
        // Check if user can view unpublished posts
        const user = await verifyAuth(request);
        const isAdmin = user && ['admin', 'manager'].includes(user.role);
        
        if (post.status !== 'published' && !isAdmin) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }
        
        // Increment view count for published posts (non-admin views)
        if (post.status === 'published' && !isAdmin) {
            await post.incrementViews();
        }
        
        return NextResponse.json({
            success: true,
            data: post,
        });
    } catch (error) {
        console.error('Blog post GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch post' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/blog/posts/[id]
 * 
 * Update a blog post. Admin/Manager only.
 */
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const existingPost = await BlogPost.findById(id);
        if (!existingPost) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }
        
        const body = await request.json();
        const oldCategory = existingPost.category;
        
        // Sanitize ObjectId fields - Convert empty strings to null
        if (body.category === '') {
            body.category = null;
        }
        
        // If title changed and no custom slug provided, regenerate slug
        if (body.title && body.title !== existingPost.title && !body.slug) {
            body.slug = await BlogPost.generateSlug(body.title, id);
        }
        
        // Handle status change to published
        if (body.status === 'published' && existingPost.status !== 'published') {
            body.publishedAt = new Date();
        }
        
        // Update SEO fields
        if (body.seo) {
            body.seo = {
                ...existingPost.seo?.toObject() || {},
                ...body.seo,
            };
        }
        
        // Update featuredImage
        if (body.featuredImage) {
            body.featuredImage = {
                ...existingPost.featuredImage?.toObject() || {},
                ...body.featuredImage,
            };
        }
        
        const updatedPost = await BlogPost.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        )
            .populate('author', 'name avatar')
            .populate('category', 'name slug color');
        
        // Update category post counts if category changed
        if (body.category !== undefined && body.category !== oldCategory?.toString()) {
            if (oldCategory) {
                await BlogCategory.updatePostCount(oldCategory);
            }
            if (body.category) {
                await BlogCategory.updatePostCount(body.category);
            }
        }
        
        return NextResponse.json({
            success: true,
            data: updatedPost,
            message: 'Post updated successfully',
        });
    } catch (error) {
        console.error('Blog post UPDATE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update post' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/blog/posts/[id]
 * 
 * Delete a blog post. Admin only.
 */
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const user = await verifyAuth(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const post = await BlogPost.findByIdAndDelete(id);
        
        if (!post) {
            return NextResponse.json(
                { error: 'Post not found' },
                { status: 404 }
            );
        }
        
        // Update category post count
        if (post.category) {
            await BlogCategory.updatePostCount(post.category);
        }
        
        return NextResponse.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Blog post DELETE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete post' },
            { status: 500 }
        );
    }
}
