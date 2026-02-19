import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import { uploadFile } from '@/lib/storage';

/**
 * GET /api/users
 * Get list of users with pagination, search, and filters
 * 
 * Response format:
 * {
 *   data: [...],
 *   links: { next: "url", prev: "url" },
 *   meta: { current_page: 1, last_page: 10, total: 100 }
 * }
 */
export async function GET(request) {
    try {
        // Verify authentication
        const token = await getAuthToken();
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // Only admins and managers can list all users
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden - Insufficient permissions' },
                { status: 403 }
            );
        }

        // Connect to database
        await connectDB();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';
        const role = searchParams.get('role') || 'all';
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build query
        const query = {};

        // Search filter (name or email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        // Status filter
        if (status !== 'all') {
            query.status = status;
        }

        // Role filter
        if (role !== 'all') {
            query.role = role;
        }

        // Calculate skip
        const skip = (page - 1) * limit;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const [users, total] = await Promise.all([
            User.find(query).sort(sort).skip(skip).limit(limit),
            User.countDocuments(query),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return NextResponse.json(
            {
                success: true,
                data: users,
                links: {
                    next: hasNext ? `${request.url.split('?')[0]}?page=${page + 1}&limit=${limit}` : null,
                    prev: hasPrev ? `${request.url.split('?')[0]}?page=${page - 1}&limit=${limit}` : null,
                },
                meta: {
                    current_page: page,
                    last_page: totalPages,
                    total: total,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch users',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/users
 * Create a new user
 * Accepts both JSON and FormData (for avatar upload)
 */
export async function POST(request) {
    try {
        // Verify authentication
        const token = await getAuthToken();
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // Check if user is admin or manager
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden - Insufficient permissions' },
                { status: 403 }
            );
        }

        // Connect to database
        await connectDB();

        // Determine content type and parse accordingly
        const contentType = request.headers.get('content-type') || '';
        let name, email, password, role, status, phone, technicalDetails, avatarFile;

        if (contentType.includes('multipart/form-data')) {
            // FormData (with avatar)
            const formData = await request.formData();
            name = formData.get('name');
            email = formData.get('email');
            password = formData.get('password');
            role = formData.get('role');
            status = formData.get('status');
            phone = formData.get('phone');
            technicalDetails = formData.get('technicalDetails');
            avatarFile = formData.get('avatar');
        } else {
            // JSON (without avatar)
            const body = await request.json();
            ({ name, email, password, role, status, phone, technicalDetails } = body);
        }

        // Managers cannot create admins
        if (decoded.role === 'manager' && role === 'admin') {
            return NextResponse.json(
                { success: false, message: 'Forbidden - Managers cannot create administrator accounts' },
                { status: 403 }
            );
        }

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Handle avatar upload if provided
        let avatarFilename = null;
        if (avatarFile && avatarFile.size > 0) {
            const uploadResult = await uploadFile(avatarFile, 'avatars');
            if (uploadResult.success) {
                avatarFilename = uploadResult.filename;
            } else {
                return NextResponse.json(
                    { success: false, message: `Avatar upload failed: ${uploadResult.error}` },
                    { status: 400 }
                );
            }
        }

        // Create new user
        const user = new User({
            name,
            email,
            password, // Will be hashed by the model pre-save hook
            role: role || 'user',
            status: status || 'active',
            phone: phone || null,
            avatar: avatarFilename,
            technicalDetails: typeof technicalDetails === 'string' ? JSON.parse(technicalDetails) : (technicalDetails || {}),
        });

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: 'User created successfully',
                user: user,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create user error:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return NextResponse.json(
                { success: false, message: messages[0] || 'Validation failed', errors: error.errors },
                { status: 400 }
            );
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: 'User with this email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to create user',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

