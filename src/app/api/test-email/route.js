import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';
import { getAuthToken } from '@/lib/cookies';
import { verifyToken } from '@/lib/jwt';

/**
 * POST /api/test-email
 * Send a test email to the current user
 * Admin/Manager only
 */
export async function POST(request) {
    try {
        const token = await getAuthToken();
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const { to, subject, body } = await request.json();

        const result = await sendMail({
            to: to || decoded.email,
            subject: subject || 'NeginTS System Test',
            html: `
                <h2>Email Configuration Test</h2>
                <p>Hello ${decoded.name || 'User'},</p>
                <p>This is a test email from your NeginTS Panel to verify that SMTP settings are correct.</p>
                <div style="padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 20px 0;">
                    <strong>Message Details:</strong><br/>
                    ${body || 'No custom message provided.'}
                </div>
                <p>If you see this, your email system is successfully integrated!</p>
            `,
            fromType: 'INFO'
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Test email sent successfully' });
        } else {
            return NextResponse.json({ success: false, message: result.error }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
