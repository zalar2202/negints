import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductCategory from '@/models/ProductCategory';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/constants/config';

// Helper for Auth check
async function checkAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.TOKEN);

    if (!token) throw new Error("Unauthorized");

    try {
        const decoded = verifyToken(token.value);
        if (decoded.role !== 'admin' && decoded.role !== 'manager') throw new Error("Forbidden");
        return decoded;
    } catch (e) {
        throw new Error("Unauthorized");
    }
}

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const category = await ProductCategory.findById(params.id);
        if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await checkAuth();
        await dbConnect();

        const body = await request.json();
        const category = await ProductCategory.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
        
        if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: category });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await checkAuth();
        await dbConnect();

        const category = await ProductCategory.findByIdAndDelete(params.id);
        if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
