import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

import { deleteImage, getImageById, updateImage } from '@/lib/storage';
import { ApiResponse, ImageMetadata, UpdateImagePayload } from '@/types';

async function deleteBlob(path?: string | null) {
    if (!path) return;
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        console.warn('BLOB_READ_WRITE_TOKEN is not configured. Skipping blob deletion.');
        return;
    }

    try {
        await del(path, { token });
    } catch (error) {
        console.error('Failed to delete blob', error);
    }
}

async function resolveParams(context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
    const params = 'then' in context.params ? await context.params : context.params;
    return params;
}

export async function GET(
    _request: NextRequest,
    context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
    const params = await resolveParams(context);
    const image = await getImageById(params.id);
    if (!image) {
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Image not found' },
            { status: 404 }
        );
    }

    return NextResponse.json<ApiResponse<ImageMetadata>>({
        success: true,
        data: image,
    });
}

export async function PUT(
    request: NextRequest,
    context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
    try {
        const payload = (await request.json()) as UpdateImagePayload;
        const params = await resolveParams(context);
        const updated = await updateImage(params.id, payload);
        return NextResponse.json<ApiResponse<ImageMetadata>>({
            success: true,
            data: updated,
        });
    } catch (error) {
        console.error('Failed to update image', error);
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Failed to update image' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
    try {
        const params = await resolveParams(context);
        const removed = await deleteImage(params.id);
        await deleteBlob(removed.blobPath);

        return NextResponse.json<ApiResponse<ImageMetadata>>({
            success: true,
            data: removed,
        });
    } catch (error) {
        console.error('Failed to delete image', error);
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}
