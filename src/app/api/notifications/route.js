/**
 * Notifications API
 * 
 * GET /api/notifications
 * - List current user's notifications (paginated)
 * 
 * POST /api/notifications
 * - Send notification (admin/manager only)
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { sendNotification, sendBulkNotification, broadcastNotification } from '@/lib/notifications';

/**
 * GET - List user's notifications
 * 
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {boolean} read - Filter by read status (optional)
 * @query {string} type - Filter by type (optional)
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

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const read = searchParams.get('read'); // null, 'true', or 'false'
        const type = searchParams.get('type') || null;

        // Connect to database
        await connectDB();

        // Get notifications
        const result = await Notification.getUserNotifications(decoded.userId, {
            page,
            limit,
            read,
            type,
        });

        return NextResponse.json({
            data: result.notifications,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * POST - Send notification (admin/manager only)
 * 
 * @body {string} recipientType - 'single', 'multiple', 'all', 'role'
 * @body {string|Array<string>} recipients - User ID(s) or role name
 * @body {string} title - Notification title
 * @body {string} message - Notification message
 * @body {string} type - Notification type
 * @body {string} actionUrl - URL to navigate to (optional)
 * @body {string} actionLabel - Button label (optional)
 */
export async function POST(request) {
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

        // Check if user is admin or manager
        const sender = await User.findById(decoded.userId);
        if (!sender || !['admin', 'manager'].includes(sender.role)) {
            return NextResponse.json(
                { error: 'Forbidden: Only admins and managers can send notifications' },
                { status: 403 }
            );
        }

        // Parse request body
        const {
            recipientType,
            recipients,
            title,
            message,
            type = 'info',
            actionUrl = null,
            actionLabel = null,
            email = false,
        } = await request.json();

        // Validate required fields
        if (!recipientType || !title || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: recipientType, title, message' },
                { status: 400 }
            );
        }

        // Validate recipient type
        const validRecipientTypes = ['single', 'multiple', 'all', 'role'];
        if (!validRecipientTypes.includes(recipientType)) {
            return NextResponse.json(
                { error: 'Invalid recipientType. Must be: single, multiple, all, or role' },
                { status: 400 }
            );
        }

        // Validate notification type
        const validTypes = ['system', 'admin', 'manager', 'info', 'warning', 'success', 'error', 'marketing'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        let result;

        // Handle different recipient types
        switch (recipientType) {
            case 'single':
                if (!recipients || typeof recipients !== 'string') {
                    return NextResponse.json(
                        { error: 'Single recipient requires a user ID string' },
                        { status: 400 }
                    );
                }

                result = await sendNotification({
                    recipientId: recipients,
                    title,
                    message,
                    type,
                    senderId: sender._id.toString(),
                    actionUrl,
                    actionLabel,
                    email,
                });
                break;

            case 'multiple':
                if (!Array.isArray(recipients) || recipients.length === 0) {
                    return NextResponse.json(
                        { error: 'Multiple recipients requires an array of user IDs' },
                        { status: 400 }
                    );
                }

                result = await sendBulkNotification({
                    recipientIds: recipients,
                    title,
                    message,
                    type,
                    senderId: sender._id.toString(),
                    actionUrl,
                    actionLabel,
                    email,
                });
                break;

            case 'all':
                result = await broadcastNotification({
                    title,
                    message,
                    type,
                    senderId: sender._id.toString(),
                    email,
                });
                break;

            case 'role':
                if (!recipients || typeof recipients !== 'string') {
                    return NextResponse.json(
                        { error: 'Role recipient requires a role name string' },
                        { status: 400 }
                    );
                }

                const validRoles = ['admin', 'manager', 'user'];
                if (!validRoles.includes(recipients)) {
                    return NextResponse.json(
                        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
                        { status: 400 }
                    );
                }

                result = await broadcastNotification({
                    title,
                    message,
                    type,
                    senderId: sender._id.toString(),
                    filters: { role: recipients },
                    email,
                });
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid recipientType' },
                    { status: 400 }
                );
        }

        console.log(`✅ Notification sent by ${sender.email} (${recipientType})`);

        return NextResponse.json({
            message: 'Notification sent successfully',
            result,
        });
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to send notification', details: error.message },
            { status: 500 }
        );
    }
}

