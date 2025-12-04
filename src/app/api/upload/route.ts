import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

import { requireAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        await requireAdminSession();
        const body = (await request.json()) as HandleUploadBody;

        const response = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => ({
                allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            }),
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Upload token generation failed:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Upload token generation failed',
            },
            { status: 400 }
        );
    }
}
