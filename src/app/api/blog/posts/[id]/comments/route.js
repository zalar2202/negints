import { NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import dbConnect from '@/lib/mongodb';

/**
 * GET /api/blog/posts/[id]/comments
 * 
 * Fetch approved comments for a specific post.
 */
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const comments = await Comment.find({
            post: id,
            status: 'approved',
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: comments,
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
 * POST /api/blog/posts/[id]/comments
 * 
 * Submit a new comment. Includes honeypot protection.
 */
export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // 1. Honeypot Protection
        // If the 'website' hidden field is filled, it's a bot
        if (body.website) {
            console.log('[SPAM DETECTED] Honeypot field filled.');
            return NextResponse.json({
                success: true,
                message: 'Comment submitted for moderation',
            });
        }

        const { authorName, authorEmail, content } = body;

        if (!authorName || !authorEmail || !content) {
            return NextResponse.json(
                { error: 'Name, email, and content are required' },
                { status: 400 }
            );
        }

        // 2. Create Comment (Pending by default)
        const comment = new Comment({
            post: id,
            authorName,
            authorEmail,
            content,
            status: 'pending',
            ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
            userAgent: request.headers.get('user-agent'),
        });

        await comment.save();

        return NextResponse.json({
            success: true,
            message: 'Comment submitted successfully and is awaiting moderation.',
            data: {
                _id: comment._id,
                authorName: comment.authorName,
                content: comment.content,
                createdAt: comment.createdAt,
            }
        });
    } catch (error) {
        console.error('Comment POST error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit comment' },
            { status: 500 }
        );
    }
}
