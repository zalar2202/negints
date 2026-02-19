import { NextResponse } from 'next/server';
import Service from '@/models/Service';
import Client from '@/models/Client';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const service = await Service.findById(id)
            .populate('user', 'name email')
            .populate('package');
        
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Access control
        if (!['admin', 'manager'].includes(user.role) && 
            service.user._id.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ success: true, data: service });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        const service = await Service.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // If service is active/activated, ensure user is added to Client list
        if (service.status === 'active') {
            const userId = service.user;
            
            const existingClient = await Client.findOne({ linkedUser: userId });
            
            if (!existingClient) {
                const userDoc = await User.findById(userId);
                if (userDoc) {
                    await Client.create({
                        name: userDoc.name,
                        email: userDoc.email,
                        phone: userDoc.phone,
                        linkedUser: userId,
                        status: 'active'
                    });
                }
            }
        }

        return NextResponse.json({ success: true, data: service });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await verifyAuth(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Service deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
