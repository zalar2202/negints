/**
 * Notifications Count API
 * 
 * GET /api/notifications/count
 * - Get unread notification count for current user
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

/**
 * GET - Get unread notification count
 */
export async function GET(request) {
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

        // Get unread count
        const unreadCount = await Notification.getUnreadCount(decoded.userId);

        return NextResponse.json({
            count: unreadCount,
        });
    } catch (error) {
        console.error('❌ Error fetching unread count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unread count', details: error.message },
            { status: 500 }
        );
    }
}

