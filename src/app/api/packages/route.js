import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';
import ProductCategory from '@/models/ProductCategory';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';

/**
 * GET /api/packages
 * Publicly fetch all active packages
 */
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const all = searchParams.get('all') === 'true'; // If true, fetching for management
        const limit = parseInt(searchParams.get('limit')) || 0;
        const slug = searchParams.get('slug');

        // If slug lookup, return single product
        if (slug) {
            const pkg = await Package.findOne({ slug }).populate({ path: 'categoryId', strictPopulate: false });
            if (!pkg) {
                return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: pkg });
        }

        const query = {};
        if (!all) {
            query.isActive = true;
        }
        if (category) {
            // Support both ObjectId-based categoryId and string-based displayCategory
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(category);
            if (isObjectId) {
                query.categoryId = category;
            } else {
                query.displayCategory = category;
            }
        }

        let q = Package.find(query).populate({ path: 'categoryId', strictPopulate: false }).sort({ order: 1, createdAt: -1 });
        if (limit > 0) {
            q = q.limit(limit);
        }
        const packages = await q;

        return NextResponse.json({ success: true, data: packages });
    } catch (error) {
        console.error('Fetch packages error:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch packages' }, { status: 500 });
    }
}

/**
 * POST /api/packages
 * Create a new package (Manager/Admin only)
 */
export async function POST(request) {
    try {
        const token = await getAuthToken();
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        await connectDB();
        const body = await request.json();
        
        // Sanitize empty SKU to null (sparse unique index only ignores null, not "")
        if (body.sku !== undefined && body.sku !== null && String(body.sku).trim() === '') {
            body.sku = null;
        }
        
        const newPackage = new Package(body);
        await newPackage.save();

        return NextResponse.json({ success: true, data: newPackage }, { status: 201 });
    } catch (error) {
        console.error('Create package error:', error);
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Failed to create package' 
        }, { status: 500 });
    }
}
