import { NextRequest, NextResponse } from 'next/server';

import { bulkCreateImages, createImage, getImages } from '@/lib/storage';
import { ApiResponse, ImageMetadata, NewImagePayload } from '@/types';

export async function GET() {
    const images = await getImages();
    return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        if (Array.isArray(payload)) {
            const created = await bulkCreateImages(payload as NewImagePayload[]);
            return NextResponse.json<ApiResponse<ImageMetadata[]>>({
                success: true,
                data: created,
            });
        }

        if (Array.isArray(payload?.items)) {
            const created = await bulkCreateImages(payload.items as NewImagePayload[]);
            return NextResponse.json<ApiResponse<ImageMetadata[]>>({
                success: true,
                data: created,
            });
        }

        const created = await createImage(payload as NewImagePayload);

        return NextResponse.json<ApiResponse<ImageMetadata>>({
            success: true,
            data: created,
        });
    } catch (error) {
        console.error('Failed to create image', error);
        return NextResponse.json<ApiResponse<null>>(
            {
                success: false,
                error: 'Failed to create image',
            },
            { status: 500 }
        );
    }
}
