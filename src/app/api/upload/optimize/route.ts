import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { put } from '@vercel/blob';

import { ApiResponse } from '@/types';
import { requireAdminSession } from '@/lib/auth';

// Optimization settings
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 85; // Increased from 80 for better quality
const WEBP_QUALITY = 85;
const PNG_COMPRESSION = 9;
const AVIF_QUALITY = 80; // AVIF provides better compression

type OptimizeRequest = {
    url?: string;
    pathname?: string;
    mimeType?: string;
};

type OptimizationResult = {
    buffer: Buffer;
    mime: string;
    format: string;
};

/**
 * Determines the best output format based on input type and size
 */
function getOutputFormat(mimeType?: string): { mime: string; format: 'png' | 'webp' | 'jpeg' | 'avif' } {
    // PNG for transparency
    if (mimeType?.includes('png')) {
        return { mime: 'image/png', format: 'png' };
    }
    // WebP is generally better than JPEG for web
    if (mimeType?.includes('webp')) {
        return { mime: 'image/webp', format: 'webp' };
    }
    // Convert JPEG to WebP for better compression
    return { mime: 'image/webp', format: 'webp' };
}

/**
 * Optimizes an image using sharp with multiple strategies
 */
async function optimizeImage(buffer: Buffer, mimeType?: string): Promise<OptimizationResult> {
    const { mime, format } = getOutputFormat(mimeType);

    console.log('[Optimize] Processing with format:', format);

    // Start with the base transformer
    let transformer = sharp(buffer)
        .rotate() // Auto-rotate based on EXIF
        .resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true,
        });

    // Apply format-specific optimizations
    let optimized: sharp.Sharp;

    switch (format) {
        case 'png':
            optimized = transformer.png({
                compressionLevel: PNG_COMPRESSION,
                palette: true, // Use palette-based compression when possible
                quality: 100,
                effort: 10, // Maximum compression effort
            });
            break;

        case 'webp':
            optimized = transformer.webp({
                quality: WEBP_QUALITY,
                effort: 6, // Good balance between speed and compression
                smartSubsample: true,
            });
            break;

        case 'avif':
            optimized = transformer.avif({
                quality: AVIF_QUALITY,
                effort: 4, // AVIF is slow, so use moderate effort
            });
            break;

        case 'jpeg':
        default:
            optimized = transformer.jpeg({
                quality: JPEG_QUALITY,
                progressive: true, // Progressive JPEGs load faster
                mozjpeg: true, // Use mozjpeg for better compression
            });
            break;
    }

    const { data: optimizedBuffer, info } = await optimized.toBuffer({ resolveWithObject: true });

    console.log('[Optimize] Optimization complete:', {
        format,
        originalSize: buffer.length,
        optimizedSize: optimizedBuffer.length,
        reduction: `${(((buffer.length - optimizedBuffer.length) / buffer.length) * 100).toFixed(2)}%`,
        dimensions: `${info.width}x${info.height}`,
    });

    return {
        buffer: optimizedBuffer,
        mime,
        format,
    };
}

/**
 * Fetches a blob with retry logic
 */
async function fetchBlobWithRetry(url: string, maxRetries = 3, retryDelay = 1000): Promise<Buffer> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    ...(process.env.BLOB_READ_WRITE_TOKEN ? {
                        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
                    } : {})
                }
            });

            if (response.ok) {
                console.log('[Optimize] Successfully fetched blob on attempt', attempt);
                const buffer = Buffer.from(await response.arrayBuffer());
                console.log('[Optimize] Fetched blob size:', buffer.length, 'bytes');
                return buffer;
            }

            console.warn(`[Optimize] Attempt ${attempt}/${maxRetries} failed:`, {
                status: response.status,
                statusText: response.statusText,
            });

            // If it's a 404, wait and retry
            if (response.status === 404 && attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
                lastError = new Error(`Blob not found (attempt ${attempt})`);
                continue;
            }

            // For other errors, throw immediately
            throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown fetch error');
            if (attempt === maxRetries) {
                console.error('[Optimize] All retry attempts failed:', {
                    url,
                    error: lastError.message,
                });
                throw new Error(`Failed to fetch blob after ${maxRetries} attempts: ${lastError.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
    }

    throw new Error(`Failed to fetch blob: ${lastError?.message || 'Unknown error'}`);
}

export async function POST(request: Request) {
    const startTime = Date.now();

    try {
        await requireAdminSession();
        const { url, pathname, mimeType }: OptimizeRequest = await request.json();

        if (!url || !pathname) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: 'Missing blob reference' },
                { status: 400 }
            );
        }

        console.log('[Optimize] Starting optimization for:', pathname);
        console.log('[Optimize] Original MIME type:', mimeType);

        // Fetch the blob
        const originalBuffer = await fetchBlobWithRetry(url);

        // Optimize the image
        const { buffer: optimizedBuffer, mime } = await optimizeImage(originalBuffer, mimeType);

        // Get image metadata
        const metadata = await sharp(optimizedBuffer).metadata();

        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
        if (!blobToken) {
            throw new Error('Missing BLOB_READ_WRITE_TOKEN for optimization');
        }

        // Only overwrite if optimization actually reduced the size
        let finalBuffer = optimizedBuffer;
        let finalMime = mime;

        if (optimizedBuffer.length < originalBuffer.length) {
            console.log('[Optimize] Optimization successful, overwriting blob');
            await put(pathname, optimizedBuffer, {
                access: 'public',
                token: blobToken,
                contentType: mime,
                addRandomSuffix: false,
                allowOverwrite: true,
            });
        } else {
            console.log('[Optimize] Original is smaller, keeping original');
            finalBuffer = originalBuffer;
            finalMime = mimeType || 'image/jpeg';
        }

        const processingTime = Date.now() - startTime;
        console.log('[Optimize] Total processing time:', processingTime, 'ms');

        return NextResponse.json<ApiResponse<{
            url: string;
            pathname: string;
            width?: number;
            height?: number;
            bytes?: number;
            mimeType?: string;
            optimizationStats?: {
                originalSize: number;
                finalSize: number;
                reduction: string;
                processingTime: number;
            };
        }>>({
            success: true,
            data: {
                url,
                pathname,
                width: metadata.width,
                height: metadata.height,
                bytes: finalBuffer.length,
                mimeType: finalMime,
                optimizationStats: {
                    originalSize: originalBuffer.length,
                    finalSize: finalBuffer.length,
                    reduction: `${(((originalBuffer.length - finalBuffer.length) / originalBuffer.length) * 100).toFixed(2)}%`,
                    processingTime,
                },
            },
        });
    } catch (error) {
        console.error('[Optimize] Optimization failed:', error);
        return NextResponse.json<ApiResponse<null>>(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Optimization failed',
            },
            { status: 500 }
        );
    }
}
