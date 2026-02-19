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

export async function GET(request) {
    await dbConnect();

    try {
        const categories = await ProductCategory.find().sort({ order: 1 });
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await checkAuth();
        await dbConnect();

        const body = await request.json();

        // Check if slug exists
        const existing = await ProductCategory.findOne({ slug: body.slug });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Slug already exists' }, { status: 400 });
        }

        const category = await ProductCategory.create(body);
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
