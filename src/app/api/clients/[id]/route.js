import { NextResponse } from 'next/server';
import Client from '@/models/Client';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

// GET Single Client
export async function GET(request, { params }) {
    try {
        await dbConnect();
        
        const { id } = await params; // Await params for Next.js 15+

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const client = await Client.findById(id).populate('linkedUser', 'name email avatar');
        
        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: client });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// UPDATE Client
export async function PUT(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params; // Await params for Next.js 15+

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        // Sanitize linkedUser
        if (body.linkedUser === "") {
            body.linkedUser = undefined; // Unset it if empty
        }

        const client = await Client.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate('linkedUser', 'name email');

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: client });
    } catch (error) {
        console.error("Update error:", error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE Client
export async function DELETE(request, { params }) {
    try {
        await dbConnect();

        const { id } = await params; // Await params for Next.js 15+

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const client = await Client.findByIdAndDelete(id);

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Client deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
