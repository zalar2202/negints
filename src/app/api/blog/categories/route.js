import { NextResponse } from 'next/server';
import BlogCategory from '@/models/BlogCategory';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

/**
 * GET /api/blog/categories
 * 
 * Fetch all blog categories.
 * Public endpoint.
 */
export async function GET(request) {
    try {
        await dbConnect();
        
        const { searchParams } = new URL(request.url);
        const tree = searchParams.get('tree') === 'true';
        const includeInactive = searchParams.get('includeInactive') === 'true';
        
        // Check admin status for inactive categories
        let showInactive = false;
        if (includeInactive) {
            const user = await verifyAuth(request);
            showInactive = user && ['admin', 'manager'].includes(user.role);
        }
        
        if (tree) {
            const categories = await BlogCategory.getTree();
            return NextResponse.json({
                success: true,
                data: categories,
            });
        }
        
        const query = showInactive ? {} : { isActive: true };
        const categories = await BlogCategory.find(query)
            .sort({ order: 1, name: 1 })
            .lean();
        
        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Categories GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/blog/categories
 * 
 * Create a new category. Admin/Manager only.
 */
export async function POST(request) {
    try {
        await dbConnect();
        
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const body = await request.json();
        const { name, description, parent, color, icon, seo, featuredImage, order } = body;
        
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }
        
        // Generate slug
        const slug = await BlogCategory.generateSlug(name);
        
        const category = new BlogCategory({
            name,
            slug,
            description,
            parent: parent || null,
            color: color || '#6366f1',
            icon,
            featuredImage,
            order: order || 0,
            seo: seo || {},
        });
        
        await category.save();
        
        return NextResponse.json({
            success: true,
            data: category,
            message: 'Category created successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Category CREATE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create category' },
            { status: 500 }
        );
    }
}
