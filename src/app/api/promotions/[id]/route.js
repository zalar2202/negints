import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const promo = await Promotion.findById(id);
        if (!promo) return NextResponse.json({ success: false, message: 'Promotion not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: promo });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'ID error' }, { status: 400 });
    }
}

export async function PUT(request, { params }) {
    try {
        const token = await getAuthToken();
        const decoded = verifyToken(token);
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const promo = await Promotion.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!promo) return NextResponse.json({ success: false, message: 'Promotion not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: promo });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const token = await getAuthToken();
        const decoded = verifyToken(token);
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;
        const promo = await Promotion.findByIdAndDelete(id);
        if (!promo) return NextResponse.json({ success: false, message: 'Promotion not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Promotion deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
