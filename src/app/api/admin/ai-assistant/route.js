import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AIAssistant from '@/models/AIAssistant';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';

export async function GET() {
    try {
        await connectDB();
        const settings = await AIAssistant.findOne();
        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const token = await getAuthToken();
        const decoded = verifyToken(token);
        
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        await connectDB();

        let settings = await AIAssistant.findOne();
        if (settings) {
            settings = await AIAssistant.findByIdAndUpdate(settings._id, {
                ...body,
                updatedBy: decoded.userId
            }, { new: true });
        } else {
            settings = await AIAssistant.create({
                ...body,
                updatedBy: decoded.userId
            });
        }

        return NextResponse.json({ success: true, data: settings });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
