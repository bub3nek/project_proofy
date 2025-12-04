import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

import { requireAdminSession } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const response = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
                // Ensure only admins can upload
                await requireAdminSession();

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    tokenPayload: JSON.stringify({
                        // optional payload
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // You can perform post-upload actions here if needed
                console.log('Upload completed:', blob.url);
            },
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Upload token generation failed:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 } // The webhook will retry 5 times waiting for a 200
        );
    }
}
