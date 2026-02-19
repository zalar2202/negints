/**
 * Debug API - Check if server can read auth cookie
 */

import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookies';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
    try {
        // Try to get auth token
        const token = await getAuthToken();
        
        if (!token) {
            return NextResponse.json({
                success: false,
                message: "No auth cookie found on server",
                hasToken: false,
            });
        }

        // Try to verify it
        try {
            const decoded = verifyToken(token);
            return NextResponse.json({
                success: true,
                message: "✅ Server can read and verify auth cookie!",
                hasToken: true,
                tokenPreview: token.substring(0, 50) + '...',
                decoded: {
                    userId: decoded.userId,
                    email: decoded.email,
                    role: decoded.role,
                },
            });
        } catch (verifyError) {
            return NextResponse.json({
                success: false,
                message: "Cookie found but verification failed",
                hasToken: true,
                tokenPreview: token.substring(0, 50) + '...',
                error: verifyError.message,
            });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Error checking cookie",
            error: error.message,
        }, { status: 500 });
    }
}

