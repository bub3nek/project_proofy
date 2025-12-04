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

        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

        if (!blobToken) {
            console.warn('Upload blocked: missing BLOB_READ_WRITE_TOKEN');
            return NextResponse.json<ApiResponse<null>>(
                {
                    success: false,
                    error: 'Blob storage token missing. Set BLOB_READ_WRITE_TOKEN in your environment.',
                },
                { status: 500 }
            );
        }

        const blobPath = `${folder}/${Date.now()}-${filename}`;
        if (isPrivate) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Private access is not supported in this deployment.' },
                { status: 400 }
            );
        }

        type PutOptions = NonNullable<Parameters<typeof put>[2]>;
        const options: PutOptions = { access: 'public', token: blobToken };

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
