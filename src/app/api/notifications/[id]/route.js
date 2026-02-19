/**
 * Single Notification API
 * 
 * PATCH /api/notifications/[id]
 * - Mark notification as read/unread
 * 
 * DELETE /api/notifications/[id]
 * - Delete notification
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

/**
 * PATCH - Mark notification as read or unread
 * 
 * @body {boolean} read - True to mark as read, false for unread
 */
export async function PATCH(request, { params }) {
    try {
        // Verify authentication
        const token = await getAuthToken();
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get notification ID from params (await in Next.js 16)
        const { id } = await params;

        // Parse request body
        const { read } = await request.json();

        if (typeof read !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid read value. Must be boolean.' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Find notification
        const notification = await Notification.findById(id);
        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (notification.recipient.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: 'Forbidden: You can only modify your own notifications' },
                { status: 403 }
            );
        }

        // Mark as read or unread
        if (read) {
            await notification.markAsRead();
        } else {
            await notification.markAsUnread();
        }

        return NextResponse.json({
            message: `Notification marked as ${read ? 'read' : 'unread'}`,
            notification,
        });
    } catch (error) {
        console.error('❌ Error updating notification:', error);
        return NextResponse.json(
            { error: 'Failed to update notification', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE - Delete notification
 */
export async function DELETE(request, { params }) {
    try {
        // Verify authentication
        const token = await getAuthToken();
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get notification ID from params (await in Next.js 16)
        const { id } = await params;

        // Connect to database
        await connectDB();

        // Find notification
        const notification = await Notification.findById(id);
        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (notification.recipient.toString() !== decoded.userId) {
            return NextResponse.json(
                { error: 'Forbidden: You can only delete your own notifications' },
                { status: 403 }
            );
        }

        // Delete notification
        await Notification.findByIdAndDelete(id);

        return NextResponse.json({
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification', details: error.message },
            { status: 500 }
        );
    }
}

