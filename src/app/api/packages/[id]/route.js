import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';

/**
 * GET /api/packages/[id]
 */
/**
 * GET /api/packages/[id]
 */
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;
        const pkg = await Package.findById(id);
        if (!pkg) {
            return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: pkg });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'ID error' }, { status: 400 });
    }
}

/**
 * PUT /api/packages/[id]
 * Manager/Admin only
 */
export async function PUT(request, { params }) {
    try {
        const token = await getAuthToken();
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();
        const { id } = await params;
        
        const pkg = await Package.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        
        if (!pkg) {
            return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: pkg });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/packages/[id]
 * Manager/Admin only
 */
export async function DELETE(request, { params }) {
    try {
        const token = await getAuthToken();
        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;
        const pkg = await Package.findByIdAndDelete(id);
        
        if (!pkg) {
            return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Package deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
