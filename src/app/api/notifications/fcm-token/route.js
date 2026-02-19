/**
 * FCM Token Registration API
 * 
 * POST /api/notifications/fcm-token
 * - Register or update FCM token for current user
 * 
 * DELETE /api/notifications/fcm-token
 * - Remove FCM token for current user
 */

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/**
 * POST - Register or update FCM token
 * 
 * @body {string} token - FCM device token
 * @body {string} device - Device type (web/ios/android)
 * @body {string} browser - Browser name (optional)
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

        // Parse request body
        const { token: fcmToken, device = 'web', browser = null } = await request.json();

        if (!fcmToken) {
            return NextResponse.json(
                { error: 'FCM token is required' },
                { status: 400 }
            );
        }

        // Validate device type
        const validDevices = ['web', 'ios', 'android'];
        if (!validDevices.includes(device)) {
            return NextResponse.json(
                { error: 'Invalid device type. Must be: web, ios, or android' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Find user and add token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Add or update FCM token
        await user.addFcmToken(fcmToken, device, browser);

        console.log(`✅ FCM token registered for user ${user.email} (${device})`);

        return NextResponse.json({
            message: 'FCM token registered successfully',
            tokenCount: user.fcmTokens.length,
        });
    } catch (error) {
        console.error('❌ Error registering FCM token:', error);
        return NextResponse.json(
            { error: 'Failed to register FCM token', details: error.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE - Remove FCM token
 * 
 * @body {string} token - FCM device token to remove
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

        // Parse request body
        const { token: fcmToken } = await request.json();

        if (!fcmToken) {
            return NextResponse.json(
                { error: 'FCM token is required' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Find user and remove token
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Remove FCM token
        await user.removeFcmToken(fcmToken);

        console.log(`✅ FCM token removed for user ${user.email}`);

        return NextResponse.json({
            message: 'FCM token removed successfully',
            tokenCount: user.fcmTokens.length,
        });
    } catch (error) {
        console.error('❌ Error removing FCM token:', error);
        return NextResponse.json(
            { error: 'Failed to remove FCM token', details: error.message },
            { status: 500 }
        );
    }
}

