import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookies';

/**
 * Test API Route to verify Axios integration with httpOnly cookies
 * GET /api/test-axios
 */
export async function GET(request) {
    try {
        // Get token from httpOnly cookie (not from header anymore!)
        const token = await getAuthToken();
        const hasToken = !!token;

        return NextResponse.json(
            {
                success: true,
                message: 'Axios is working correctly with httpOnly cookies! 🎉',
                details: {
                    method: 'GET',
                    timestamp: new Date().toISOString(),
                    hasAuthCookie: hasToken,
                    cookieStatus: hasToken ? '✓ Cookie Found' : '✗ No Cookie',
                    securityNote: 'Token is in httpOnly cookie (JavaScript cannot access it)',
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Test Axios endpoint error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Axios test failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}

/**
 * POST endpoint to test Axios with body data and httpOnly cookies
 * POST /api/test-axios
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const token = await getAuthToken();

        return NextResponse.json(
            {
                success: true,
                message: 'POST request received successfully! 🎉',
                details: {
                    method: 'POST',
                    timestamp: new Date().toISOString(),
                    receivedData: body,
                    hasAuthCookie: !!token,
                    cookieStatus: !!token ? '✓ Cookie Found' : '✗ No Cookie',
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Test Axios POST endpoint error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'POST request failed',
                error: error.message,
            },
            { status: 500 }
        );
    }
}

