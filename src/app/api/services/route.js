import { NextResponse } from 'next/server';
import Service from '@/models/Service';
import Package from '@/models/Package';
import Client from '@/models/Client';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';

export async function GET(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const isAdmin = ['admin', 'manager'].includes(user.role);
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        let query = {};
        
        if (isAdmin) {
            if (userId) query.user = userId;
        } else {
            query.user = user._id;
        }

        const services = await Service.find(query)
            .populate('user', 'name email')
            .populate('package', 'name description price duration')
            .populate('invoice')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: services });
    } catch (error) {
        console.error('Service fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();

        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.user || !body.package || !body.price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const service = await Service.create(body);

        // If service is active, ensure user is added to Client list
        if (service.status === 'active') {
            const userId = body.user;
            const user = await User.findById(userId);
            
            if (user) {
                const existingClient = await Client.findOne({ linkedUser: userId });
                
                if (!existingClient) {
                    await Client.create({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        linkedUser: userId,
                        status: 'active'
                    });
                }
            }
        }

        return NextResponse.json({ success: true, data: service }, { status: 201 });

    } catch (error) {
        console.error('Service creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
