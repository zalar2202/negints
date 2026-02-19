import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Client from '@/models/Client';
import User from '@/models/User'; // Ensure User model is loaded
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Authenticate
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Fetch Clients (with linked User details)
        const clients = await Client.find({})
            .populate('linkedUser', 'name email avatar')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: clients });
    } catch (error) {
        console.error('Client fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();

        // 1. Authenticate
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        
        // Sanitize linkedUser to avoid cast error for empty string
        if (body.linkedUser === "") {
            body.linkedUser = undefined;
        }

        // 2. Create Client
        const client = await Client.create(body);

        return NextResponse.json({ success: true, data: client }, { status: 201 });

    } catch (error) {
        console.error('Client creation error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
