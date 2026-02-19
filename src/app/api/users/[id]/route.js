import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { getAuthToken } from '@/lib/cookies';
import { uploadFile, deleteFile } from '@/lib/storage';

/**
 * GET /api/users/[id]
 * Get a single user by ID
 */
export async function GET(request, { params }) {
    try {
        // Verify authentication
        const token = await getAuthToken();
        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        try {
            verifyToken(token);
        } catch (error) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // Connect to database
        await connectDB();

        // In Next.js 16, params need to be awaited
        const { id } = await params;

        // Find user by ID
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(
            {
                success: true,
                user: user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/users/[id]
 * Update a user by ID
 * Accepts both JSON and FormData (for avatar upload)
 */
export async function PUT(request, { params }) {
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

        // Check if user is admin
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden - Insufficient permissions' },
                { status: 403 }
            );
        }

        // Connect to database
        await connectDB();

        // In Next.js 16, params need to be awaited
        const { id } = await params;

        // Find user
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Determine content type and parse accordingly
        const contentType = request.headers.get('content-type') || '';
        let name, email, password, role, status, phone, technicalDetails, avatarFile, removeAvatar;

        if (contentType.includes('multipart/form-data')) {
            // FormData (with possible avatar)
            const formData = await request.formData();
            name = formData.get('name');
            email = formData.get('email');
            password = formData.get('password');
            role = formData.get('role');
            status = formData.get('status');
            phone = formData.get('phone');
            technicalDetails = formData.get('technicalDetails');
            avatarFile = formData.get('avatar');
            removeAvatar = formData.get('removeAvatar') === 'true';
        } else {
            const body = await request.json();
            ({ name, email, password, role, status, phone, technicalDetails, removeAvatar } = body);
        }

        // Managers cannot update admins or promote to admin
        if (decoded.role === 'manager') {
            if (user.role === 'admin') {
                return NextResponse.json(
                    { success: false, message: 'Forbidden - Managers cannot modify administrator accounts' },
                    { status: 403 }
                );
            }
            if (role === 'admin') {
                return NextResponse.json(
                    { success: false, message: 'Forbidden - Managers cannot promote users to administrator' },
                    { status: 403 }
                );
            }
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = password; // Will be hashed by pre-save hook
        if (role) user.role = role;
        if (status) user.status = status;
        if (phone !== undefined) user.phone = phone;
        if (technicalDetails !== undefined) {
             // Handle if technicalDetails is a string (from FormData)
             if (typeof technicalDetails === 'string') {
                 try {
                     user.technicalDetails = { ...user.technicalDetails, ...JSON.parse(technicalDetails) };
                 } catch (e) {
                     console.error('Error parsing technicalDetails:', e);
                 }
             } else {
                 user.technicalDetails = { ...user.technicalDetails, ...technicalDetails };
             }
        }

        // Handle avatar removal
        if (removeAvatar) {
            if (user.avatar) {
                await deleteFile(user.avatar, 'avatars');
                user.avatar = null;
            }
        }

        // Handle avatar upload if provided
        if (avatarFile && avatarFile.size > 0) {
            const oldAvatar = user.avatar;
            const uploadResult = await uploadFile(avatarFile, 'avatars', oldAvatar);
            
            if (uploadResult.success) {
                user.avatar = uploadResult.filename;
            } else {
                return NextResponse.json(
                    { success: false, message: `Avatar upload failed: ${uploadResult.error}` },
                    { status: 400 }
                );
            }
        }

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: 'User updated successfully',
                user: user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update user error:', error);

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
                message: 'Failed to update user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/users/[id]
 * Delete a user by ID (also deletes avatar file)
 */
export async function DELETE(request, { params }) {
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

        // Check if user is admin
        if (!['admin', 'manager'].includes(decoded.role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden - Insufficient permissions' },
                { status: 403 }
            );
        }

        // Connect to database
        await connectDB();

        // In Next.js 16, params need to be awaited
        const { id } = await params;

        // Prevent deleting yourself
        if (decoded.userId === id) {
            return NextResponse.json(
                { success: false, message: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        // Find user first to get avatar filename
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Managers cannot delete admins
        if (decoded.role === 'manager' && user.role === 'admin') {
            return NextResponse.json(
                { success: false, message: 'Forbidden - Managers cannot delete administrator accounts' },
                { status: 403 }
            );
        }

        // Delete avatar file if exists
        if (user.avatar) {
            await deleteFile(user.avatar, 'avatars');
        }

        // Delete user from database
        await User.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message: 'User deleted successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to delete user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            },
            { status: 500 }
        );
    }
}

