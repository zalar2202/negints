import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AIAssistant from '@/models/AIAssistant';
import axios from 'axios';

export async function POST(request) {
    try {
        const body = await request.json();
        const { message, sessionId, history } = body;

        if (!message) {
            return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
        }

        await connectDB();
        const settings = await AIAssistant.findOne();

        if (!settings || !settings.isActive || !settings.webhookUrl) {
            return NextResponse.json({ success: false, message: 'AI Assistant is currently offline' }, { status: 503 });
        }

        // Forward to n8n privately from our server
        const { data } = await axios.post(settings.webhookUrl, {
            message,
            sessionId,
            history
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Secure Chat API Error:', error.message);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to communicate with AI engine' 
        }, { status: 500 });
    }
}
