import { NextResponse } from 'next/server';
import Media from '@/models/Media';
import { verifyAuth } from '@/lib/auth';
import { deleteFile } from '@/lib/storage';
import dbConnect from '@/lib/mongodb';

/**
 * PATCH /api/media/[id]
 * 
 * Update media metadata (alt, caption, tags, folder, filename).
 * Admin/Manager only.
 */
export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        
        const user = await verifyAuth(request);
        if (!user || !['admin', 'manager'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const { id } = await params;
        const body = await request.json();
        
        const media = await Media.findById(id);
        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }
        
        // Allowed update fields
        const allowedUpdates = ['alt', 'caption', 'tags', 'originalName', 'folder'];
        
        Object.keys(body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                media[key] = body[key];
            }
        });
        
        await media.save();
        
        return NextResponse.json({
            success: true,
            data: media,
            message: 'Media updated successfully'
        });
    } catch (error) {
        console.error('Media UPDATE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update media' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/media/[id]
 * 
 * Delete a single media item.
 * Admin only.
 */
export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        
        const user = await verifyAuth(request);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        
        const { id } = await params;
        
        const media = await Media.findById(id);
        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }
        
        // Delete file from storage
        try {
            await deleteFile(media.filename, media.folder);
        } catch (err) {
            console.error(`Failed to delete file: ${media.filename}`, err);
            // Continue to delete from DB even if file deletion fails (orphaned files can be cleaned up later if needed or manually)
        }
        
        await Media.deleteOne({ _id: id });
        
        return NextResponse.json({
            success: true,
            message: 'Media deleted successfully'
        });
    } catch (error) {
        console.error('Media DELETE error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete media' },
            { status: 500 }
        );
    }
}
