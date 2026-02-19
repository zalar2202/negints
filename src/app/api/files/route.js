import { NextResponse } from 'next/server';
import { getFile, getPlaceholderImage } from '@/lib/storage';

/**
 * File Serving API Route
 * 
 * GET /api/files?category=avatars&filename=abc-123.png
 * 
 * Serves uploaded files with proper Content-Type headers
 * Returns placeholder image if file not found
 * 
 * Query Parameters:
 * - filename (required): Name of the file to retrieve
 * - category (optional): Storage category (avatars, receipts, documents) - defaults to 'avatars'
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');
        const category = searchParams.get('category') || 'avatars';

        // Validate filename provided
        if (!filename) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Filename is required',
                },
                { status: 400 }
            );
        }

        // Get file from storage
        const result = await getFile(filename, category);

        // If file not found, return placeholder (for avatars only)
        if (!result.success) {
            if (category === 'avatars') {
                const placeholder = getPlaceholderImage();
                if (placeholder.success) {
                    return new NextResponse(placeholder.stream, {
                        headers: {
                            'Content-Type': placeholder.contentType,
                            'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
                        },
                    });
                }
            }

            // Return 404 for non-avatar files or if placeholder not found
            return NextResponse.json(
                {
                    success: false,
                    message: result.error || 'File not found',
                },
                { status: 404 }
            );
        }

        // Stream file with appropriate Content-Type
        return new NextResponse(result.stream, {
            headers: {
                'Content-Type': result.contentType,
                'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
            },
        });
    } catch (error) {
        console.error('File serving error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to serve file',
            },
            { status: 500 }
        );
    }
}

