import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

import { ApiResponse } from '@/types';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const accessField = (formData.get('access') || 'public').toString();
        const isPrivate = accessField === 'private';
        const folder = (formData.get('folder') as string) || 'proofy';
        const filename = (formData.get('filename') as string) || (file as File)?.name || 'upload';

        if (!file || !(file instanceof File)) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Missing file in upload request' },
                { status: 400 }
            );
        }

        const blobPath = `${folder}/${Date.now()}-${filename}`;
        const options: {
            access?: 'public';
            token?: string;
        } = {};

        if (!isPrivate) {
            options.access = 'public';
        }

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            options.token = process.env.BLOB_READ_WRITE_TOKEN;
        }

        const blob = await put(blobPath, file, options);

        return NextResponse.json({
            success: true,
            data: blob,
        });
    } catch (error) {
        console.error('Upload failed', error);
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}
