import { NextResponse } from 'next/server';
import Media from '@/models/Media';
import { verifyAuth } from '@/lib/auth';
import { uploadFile, deleteFile } from '@/lib/storage';
import dbConnect from '@/lib/mongodb';

/**
 * GET /api/media
 * 
 * Fetch media library with filtering and pagination.
 * Admin/Manager only.
 */
export async function GET(request) {
    try {
        await dbConnect();
        
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 24;
        const folder = searchParams.get('folder') || 'blog';
        const type = searchParams.get('type'); // image, video, document
        const search = searchParams.get('search');
        
        const skip = (page - 1) * limit;
        
        // Build query
        const query = { folder };
        
        if (type) {
            query.mimeType = new RegExp(`^${type}/`);
        }
        
        if (search) {
            query.$or = [
                { originalName: new RegExp(search, 'i') },
                { alt: new RegExp(search, 'i') },
                { tags: search.toLowerCase() },
            ];
        }
        
        const [media, total] = await Promise.all([
            Media.find(query)
                .populate('uploadedBy', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Media.countDocuments(query),
        ]);
        
        return NextResponse.json({
            success: true,
            data: media,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Media GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch media' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/media
 * 
 * Upload new media file. Admin/Manager only.
 */
export async function POST(request) {
    try {
        await dbConnect();
        
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'blog';
        const alt = formData.get('alt') || '';
        const caption = formData.get('caption') || '';
        const tagsString = formData.get('tags') || '';
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }
        
        // Validate file type for images
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'video/mp4',
            'video/webm',
        ];
        
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'File type not allowed' },
                { status: 400 }
            );
        }
        
        // Upload file
        const result = await uploadFile(file, folder);
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Upload failed' },
                { status: 400 }
            );
        }
        
        // Get image dimensions if applicable
        let dimensions = {};
        if (file.type.startsWith('image/')) {
            // Dimensions will be set client-side or via image processing later
            dimensions = { width: null, height: null };
        }
        
        // Parse tags
        const tags = tagsString
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);
        
        // Create media record
        const media = new Media({
            filename: result.filename,
            originalName: file.name,
            url: result.url,
            path: result.path,
            mimeType: file.type,
            size: file.size,
            dimensions,
            folder,
            alt,
            caption,
            tags,
            uploadedBy: user._id,
        });
        
        await media.save();
        await media.populate('uploadedBy', 'name');
        
        return NextResponse.json({
            success: true,
            data: media,
            message: 'File uploaded successfully',
        }, { status: 201 });
    } catch (error) {
        console.error('Media UPLOAD error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/media
 * 
 * Bulk delete media files. Admin only.
 */
export async function DELETE(request) {
    try {
        await dbConnect();
        
        const user = await verifyAuth(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const body = await request.json();
        const { ids } = body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'No media IDs provided' },
                { status: 400 }
            );
        }
        
        // Get media records
        const mediaItems = await Media.find({ _id: { $in: ids } });
        
        // Delete files from storage
        for (const item of mediaItems) {
            try {
                await deleteFile(item.filename, item.folder);
            } catch (err) {
                console.error(`Failed to delete file: ${item.filename}`, err);
            }
        }
        
        // Delete database records
        await Media.deleteMany({ _id: { $in: ids } });
        
        return NextResponse.json({
            success: true,
            message: `${ids.length} file(s) deleted successfully`,
        });
    } catch (error) {
        console.error('Media DELETE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete media' },
            { status: 500 }
        );
    }
}
