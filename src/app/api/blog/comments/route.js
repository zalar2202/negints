import { NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import BlogPost from '@/models/BlogPost'; // Ensure model is registered
import dbConnect from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';

/**
 * GET /api/blog/comments
 * 
 * Fetch all comments with pagination and filtering.
 * Admin only.
 */
export async function GET(request) {
    try {
        await dbConnect();

        // Auth check
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status'); // 'pending', 'approved', 'spam', 'trash'
        
        const skip = (page - 1) * limit;
        
        // Build query
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const comments = await Comment.find(query)
            .populate('post', 'title slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: comments,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Comments GET error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/blog/comments
 * 
 * Bulk update comment status (approve, spam, trash).
 * Admin only.
 */
export async function PATCH(request) {
    try {
        await dbConnect();

        // Auth check
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { commentIds, status } = body;

        if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
            return NextResponse.json({ error: 'Invalid comment IDs' }, { status: 400 });
        }

        if (!['approved', 'pending', 'spam', 'trash'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const result = await Comment.updateMany(
            { _id: { $in: commentIds } },
            { $set: { status } }
        );

        return NextResponse.json({
            success: true,
            message: `Updated ${result.modifiedCount} comments to ${status}`,
        });
    } catch (error) {
        console.error('Comments PATCH error:', error);
        return NextResponse.json(
            { error: 'Failed to update comments' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/blog/comments
 * 
 * Permanently delete comments.
 * Admin only.
 */
export async function DELETE(request) {
    try {
        await dbConnect();

        // Auth check
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            // Delete single
            await Comment.findByIdAndDelete(id);
        } else {
            // Delete all in 'trash' (optional feature, but safest to just support single or bulk via body if needed)
            // For this implementation, let's look for a body for bulk delete
            try {
                const body = await request.json();
                if (body.commentIds && Array.isArray(body.commentIds)) {
                     await Comment.deleteMany({ _id: { $in: body.commentIds } });
                }
            } catch (e) {
                // No body, just ignore
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Comments deleted permanently',
        });
    } catch (error) {
        console.error('Comments DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete comments' },
            { status: 500 }
        );
    }
}
