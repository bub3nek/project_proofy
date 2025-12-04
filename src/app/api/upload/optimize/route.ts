import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { put } from '@vercel/blob';

import { ApiResponse } from '@/types';
import { requireAdminSession } from '@/lib/auth';

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 80;
const PNG_COMPRESSION = 9;

type OptimizeRequest = {
    url?: string;
    pathname?: string;
    mimeType?: string;
};

function getOutputFormat(mimeType?: string) {
    if (mimeType?.includes('png')) {
        return { mime: 'image/png', format: 'png' as const };
    }
    if (mimeType?.includes('webp')) {
        return { mime: 'image/webp', format: 'webp' as const };
    }
    return { mime: 'image/jpeg', format: 'jpeg' as const };
}

export async function POST(request: Request) {
    try {
        await requireAdminSession();
        const { url, pathname, mimeType }: OptimizeRequest = await request.json();

        if (!url || !pathname) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Missing blob reference' },
                { status: 400 }
            );
        }

        const blobResponse = await fetch(url);
        if (!blobResponse.ok) {
            throw new Error(`Failed to fetch blob: ${blobResponse.status} ${blobResponse.statusText}`);
        }

        const originalBuffer = Buffer.from(await blobResponse.arrayBuffer());
        const transformer = sharp(originalBuffer).rotate();
        const resized = transformer.resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true,
        });

        const { mime, format } = getOutputFormat(mimeType);
        const toFormat = format === 'png'
            ? resized.png({ compressionLevel: PNG_COMPRESSION })
            : format === 'webp'
                ? resized.webp({ quality: JPEG_QUALITY })
                : resized.jpeg({ quality: JPEG_QUALITY });

        const { data: optimizedBuffer, info } = await toFormat.toBuffer({ resolveWithObject: true });

        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
        if (!blobToken) {
            throw new Error('Missing BLOB_READ_WRITE_TOKEN for optimization');
        }

        if (optimizedBuffer.length < originalBuffer.length) {
            await put(pathname, optimizedBuffer, {
                access: 'public',
                token: blobToken,
                contentType: mime,
                addRandomSuffix: false,
            });
        }

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
                url,
                pathname,
                width: info.width,
                height: info.height,
                bytes: Math.min(optimizedBuffer.length, originalBuffer.length),
                mimeType: mime,
            },
        });
    } catch (error) {
        console.error('Optimization failed', error);
        return NextResponse.json<ApiResponse<null>>(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Optimization failed',
            },
            { status: 500 }
        );
    }
}
