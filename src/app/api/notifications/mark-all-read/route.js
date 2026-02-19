/**
 * Mark All Notifications as Read API
 * 
 * PATCH /api/notifications/mark-all-read
 * - Mark all notifications as read for current user
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

/**
 * PATCH - Mark all notifications as read
 */
export async function PATCH(request) {
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

        // Connect to database
        await connectDB();

        // Mark all as read
        const result = await Notification.markAllAsRead(decoded.userId);

        return NextResponse.json({
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('❌ Error marking all as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark all as read', details: error.message },
            { status: 500 }
        );
    }
}

