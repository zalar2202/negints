import { NextResponse } from 'next/server';
import BlogCategory from '@/models/BlogCategory';
import BlogPost from '@/models/BlogPost';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

/**
 * GET /api/blog/categories/[id]
 * 
 * Fetch a single category by ID or slug.
 */
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);
        
        let category;
        if (isSlug) {
            category = await BlogCategory.findOne({ slug: id }).lean();
        } else {
            category = await BlogCategory.findById(id).lean();
        }
        
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        console.error('Category GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/blog/categories/[id]
 * 
 * Update a category. Admin/Manager only.
 */
export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const existingCategory = await BlogCategory.findById(id);
        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        const body = await request.json();
        
        // If name changed and no custom slug, regenerate
        if (body.name && body.name !== existingCategory.name && !body.slug) {
            body.slug = await BlogCategory.generateSlug(body.name, id);
        }
        
        // Normalize parent field to null if empty string
        if (body.parent === '') {
            body.parent = null;
        }

        // Prevent self-parenting
        if (body.parent === id) {
            return NextResponse.json(
                { error: 'Category cannot be its own parent' },
                { status: 400 }
            );
        }
        
        const updatedCategory = await BlogCategory.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );
        
        return NextResponse.json({
            success: true,
            data: updatedCategory,
            message: 'Category updated successfully',
        });
    } catch (error) {
        console.error('Category UPDATE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update category' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/blog/categories/[id]
 * 
 * Delete a category. Admin only.
 * Will set posts in this category to uncategorized.
 */
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const user = await verifyAuth(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const category = await BlogCategory.findById(id);
        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }
        
        // Check if has children
        const children = await BlogCategory.countDocuments({ parent: id });
        if (children > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with subcategories. Delete or reassign them first.' },
                { status: 400 }
            );
        }
        
        // Move posts to uncategorized
        await BlogPost.updateMany(
            { category: id },
            { $unset: { category: 1 } }
        );
        
        await BlogCategory.findByIdAndDelete(id);
        
        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (error) {
        console.error('Category DELETE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete category' },
            { status: 500 }
        );
    }
}
