import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';

import { ApiResponse } from '@/types';
import { requireAdminSession } from '@/lib/auth';

const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 80;

function sanitizeFilename(name: string) {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')
        .slice(0, 48) || 'upload';
}

export async function POST(request: Request) {
    try {
        await requireAdminSession();

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
                { success: false, error: 'Blob storage token missing. Set BLOB_READ_WRITE_TOKEN.' },
                { status: 500 }
            );
        }

        if (isPrivate) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Private access is not supported in this deployment.' },
                { status: 400 }
            );
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const transformer = sharp(fileBuffer).rotate();
        const metadata = await transformer.metadata();

        transformer.resize({
            width: metadata.width && metadata.width > MAX_DIMENSION ? MAX_DIMENSION : undefined,
            height: metadata.height && metadata.height > MAX_DIMENSION ? MAX_DIMENSION : undefined,
            fit: 'inside',
            withoutEnlargement: true,
        });

        const { data: optimizedBuffer, info } = await transformer
            .webp({ quality: WEBP_QUALITY })
            .toBuffer({ resolveWithObject: true });

        const optimizedMime = 'image/webp';
        const baseName = sanitizeFilename(filename.replace(/\.[^.]+$/, ''));
        const blobPath = `${folder}/${Date.now()}-${baseName || 'image'}.webp`;

        type PutOptions = NonNullable<Parameters<typeof put>[2]>;
        const options: PutOptions = {
            access: 'public',
            token: blobToken,
            contentType: optimizedMime,
        };

        const blob = await put(blobPath, optimizedBuffer, options);

        return NextResponse.json<ApiResponse<{
            url: string;
            pathname: string;
            width?: number;
            height?: number;
            bytes?: number;
            mimeType?: string;
        }>>({
            success: true,
            data: {
                url: blob.url,
                pathname: blob.pathname,
                width: info.width,
                height: info.height,
                bytes: info.size,
                mimeType: optimizedMime,
            },
        });
    } catch (error) {
        console.error('Upload failed', error);
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Upload failed' },
            { status: 500 }
        );
    }
}
