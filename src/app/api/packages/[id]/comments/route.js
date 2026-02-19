import { NextResponse } from 'next/server';
import Comment from '@/models/Comment';
import dbConnect from '@/lib/mongodb';

/**
 * GET /api/packages/[id]/comments
 * 
 * Fetch approved comments for a specific product.
 */
export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const comments = await Comment.find({
            package: id,
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
 * POST /api/packages/[id]/comments
 * 
 * Submit a new comment for a product. Includes honeypot protection.
 */
export async function POST(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // 1. Honeypot Protection
        if (body.website) {
            console.log('[SPAM DETECTED] Honeypot field filled.');
            return NextResponse.json({
                success: true,
                message: 'دیدگاه شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد.',
            });
        }

        const { authorName, authorEmail, content } = body;

        if (!authorName || !authorEmail || !content) {
            return NextResponse.json(
                { error: 'نام، ایمیل و متن نظر الزامی هستند.' },
                { status: 400 }
            );
        }

        // 2. Create Comment (Pending by default)
        const comment = new Comment({
            package: id,
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
            message: 'دیدگاه شما با موفقیت ثبت شد و پس از تایید مدیریت نمایش داده خواهد شد.',
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
            { error: error.message || 'خطا در ثبت دیدگاه' },
            { status: 500 }
        );
    }
}
