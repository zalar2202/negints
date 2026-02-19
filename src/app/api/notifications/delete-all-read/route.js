/**
 * Delete All Read Notifications API
 * 
 * DELETE /api/notifications/delete-all-read
 * - Delete all read notifications for current user
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

/**
 * DELETE - Delete all read notifications
 */
export async function DELETE(request) {
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

        // Delete all read notifications
        const result = await Notification.deleteAllRead(decoded.userId);

        return NextResponse.json({
            message: 'All read notifications deleted',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('❌ Error deleting read notifications:', error);
        return NextResponse.json(
            { error: 'Failed to delete read notifications', details: error.message },
            { status: 500 }
        );
    }
}

