import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';

export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';

        const query = {};
        if (!all) {
            query.isActive = true;
            query.startDate = { $lte: new Date() };
            query.$or = [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }];
        }

        const promotions = await Promotion.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: promotions });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch promotions' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const token = await getAuthToken();
        const decoded = verifyToken(token);
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();
        const newPromotion = new Promotion(body);
        await newPromotion.save();

        return NextResponse.json({ success: true, data: newPromotion }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
