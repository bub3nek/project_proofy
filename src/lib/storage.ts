import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { ImageMetadata, NewImagePayload, UpdateImagePayload } from '@/types';
import { getWeekNumber } from './utils';
import { enhanceWithSmartMetadata } from './image-intelligence';
import { isPostgresAvailable, sql } from './database';

const DATA_FILE = path.join(process.cwd(), 'data', 'images.json');

type StorageAdapter = {
    getImages(): Promise<ImageMetadata[]>;
    getImageById(id: string): Promise<ImageMetadata | undefined>;
    createImage(payload: NewImagePayload): Promise<ImageMetadata>;
    updateImage(id: string, updates: UpdateImagePayload): Promise<ImageMetadata>;
    deleteImage(id: string): Promise<ImageMetadata>;
    bulkCreateImages(payloads: NewImagePayload[]): Promise<ImageMetadata[]>;
};

function normalizeTags(tags: string[] = []) {
    return Array.from(
        new Set(
            tags
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => tag.toUpperCase())
        )
    );
}

function buildImageRecord(payload: NewImagePayload): ImageMetadata {
    const date = payload.date || new Date().toISOString();
    const storeName = payload.store?.trim().toUpperCase() || 'UNKNOWN';
    const base: ImageMetadata = {
        id: crypto.randomUUID(),
        url: payload.url,
        blobPath: payload.blobPath,
        width: payload.width,
        height: payload.height,
        bytes: payload.bytes,
        mimeType: payload.mimeType,
        placeholder: payload.placeholder,
        store: storeName,
        date,
        week: getWeekNumber(date),
        tags: normalizeTags(payload.tags || []),
        notes: payload.notes?.trim() || '',
        uploadedAt: new Date().toISOString(),
        gps: payload.gps,
        camera: payload.camera,
    };
    return enhanceWithSmartMetadata(base);
}

function mergeImageUpdates(current: ImageMetadata, updates: UpdateImagePayload) {
    const nextDate = updates.date ?? current.date;
    return enhanceWithSmartMetadata({
        ...current,
        ...updates,
        date: nextDate,
        week: getWeekNumber(nextDate),
        tags: updates.tags ? normalizeTags(updates.tags) : current.tags,
    });
}

async function readImages(): Promise<ImageMetadata[]> {
    try {
        const file = await fs.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(file) as ImageMetadata[];
        return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeImages(images: ImageMetadata[]) {
    await fs.writeFile(DATA_FILE, JSON.stringify(images, null, 4), 'utf-8');
}

function createFileAdapter(): StorageAdapter {
    return {
        async getImages() {
            const images = (await readImages()).map(enhanceWithSmartMetadata);
            return images.sort((a, b) => {
                const sortA = a.sortKey ?? new Date(a.date).getTime();
                const sortB = b.sortKey ?? new Date(b.date).getTime();
                return sortB - sortA;
            });
        },
        async getImageById(id: string) {
            const images = await readImages();
            return images.find((img) => img.id === id);
        },
        async createImage(payload: NewImagePayload) {
            const images = await readImages();
            const image = buildImageRecord(payload);
            const updated = [image, ...images];
            await writeImages(updated);
            return image;
        },
        async updateImage(id: string, updates: UpdateImagePayload) {
            const images = await readImages();
            const index = images.findIndex((img) => img.id === id);

            if (index === -1) {
                throw new Error('Image not found');
            }

            const nextImage = mergeImageUpdates(images[index], updates);
            images[index] = nextImage;
            await writeImages(images);
            return nextImage;
        },
        async deleteImage(id: string) {
            const images = await readImages();
            const index = images.findIndex((img) => img.id === id);

            if (index === -1) {
                throw new Error('Image not found');
            }

            const [removed] = images.splice(index, 1);
            await writeImages(images);
            return removed;
        },
        async bulkCreateImages(payloads: NewImagePayload[]) {
            if (!payloads.length) return [];
            const images = await readImages();
            const newRecords = payloads.map(buildImageRecord);
            const updated = [...newRecords, ...images];
            await writeImages(updated);
            return newRecords;
        },
    };
}

function createPostgresAdapter(): StorageAdapter {
    let ensured = false;

    async function ensureTable() {
        if (ensured) return;
        await sql`
            CREATE TABLE IF NOT EXISTS proofy_images (
                id UUID PRIMARY KEY,
                url TEXT NOT NULL,
                blob_path TEXT,
                width INTEGER,
                height INTEGER,
                bytes BIGINT,
                mime_type TEXT,
                placeholder TEXT,
                store TEXT NOT NULL,
                date TEXT NOT NULL,
                week INTEGER NOT NULL,
                tags JSONB NOT NULL DEFAULT '[]'::jsonb,
                notes TEXT NOT NULL DEFAULT '',
                uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                sort_key BIGINT,
                gps_latitude DOUBLE PRECISION,
                gps_longitude DOUBLE PRECISION,
                camera_make TEXT,
                camera_model TEXT
            );
        `;
        ensured = true;
    }

    function mapRow(row: Record<string, unknown>): ImageMetadata {
        function parseTags(value: unknown): string[] {
            if (Array.isArray(value)) {
                return value.filter((item): item is string => typeof item === 'string');
            }
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
                } catch {
                    return [];
                }
            }
            return [];
        }

        return {
            id: row.id as string,
            url: row.url as string,
            blobPath: (row.blob_path as string | null) ?? undefined,
            width: row.width === null || row.width === undefined ? undefined : Number(row.width),
            height: row.height === null || row.height === undefined ? undefined : Number(row.height),
            bytes: row.bytes === null || row.bytes === undefined ? undefined : Number(row.bytes),
            mimeType: (row.mime_type as string | null) ?? undefined,
            placeholder: (row.placeholder as string | null) ?? undefined,
            store: row.store as string,
            date: row.date as string,
            week: Number(row.week),
            tags: parseTags(row.tags),
            notes: (row.notes as string) || '',
            uploadedAt:
                row.uploaded_at instanceof Date
                    ? row.uploaded_at.toISOString()
                    : ((row.uploaded_at as string | null) ?? new Date().toISOString()),
            sortKey: row.sort_key === null || row.sort_key === undefined ? undefined : Number(row.sort_key),
            gps: (row.gps_latitude !== null && row.gps_latitude !== undefined &&
                row.gps_longitude !== null && row.gps_longitude !== undefined) ? {
                latitude: Number(row.gps_latitude),
                longitude: Number(row.gps_longitude),
            } : undefined,
            camera: (row.camera_make || row.camera_model) ? {
                make: (row.camera_make as string | null) ?? undefined,
                model: (row.camera_model as string | null) ?? undefined,
            } : undefined,
        };
    }

    async function fetchImage(id: string) {
        await ensureTable();
        const result = await sql`
            SELECT *
            FROM proofy_images
            WHERE id = ${id}
            LIMIT 1
        `;
        const row = result.rows[0];
        return row ? mapRow(row) : undefined;
    }

    return {
        async getImages() {
            await ensureTable();
            const result = await sql`
                SELECT *
                FROM proofy_images
                ORDER BY sort_key DESC NULLS LAST, uploaded_at DESC
            `;
            return result.rows.map(mapRow).map(enhanceWithSmartMetadata);
        },
        async getImageById(id: string) {
            return fetchImage(id);
        },
        async createImage(payload: NewImagePayload) {
            await ensureTable();
            const image = buildImageRecord(payload);
            await sql`
                INSERT INTO proofy_images (
                    id,
                    url,
                    blob_path,
                    width,
                    height,
                    bytes,
                    mime_type,
                    placeholder,
                    store,
                    date,
                    week,
                    tags,
                    notes,
                    uploaded_at,
                    sort_key,
                    gps_latitude,
                    gps_longitude,
                    camera_make,
                    camera_model
                )
                VALUES (
                    ${image.id},
                    ${image.url},
                    ${image.blobPath ?? null},
                    ${image.width ?? null},
                    ${image.height ?? null},
                    ${image.bytes ?? null},
                    ${image.mimeType ?? null},
                    ${image.placeholder ?? null},
                    ${image.store},
                    ${image.date},
                    ${image.week},
                    ${JSON.stringify(image.tags)},
                    ${image.notes},
                    ${image.uploadedAt},
                    ${image.sortKey ?? null},
                    ${image.gps?.latitude ?? null},
                    ${image.gps?.longitude ?? null},
                    ${image.camera?.make ?? null},
                    ${image.camera?.model ?? null}
                )
            `;
            return image;
        },
        async updateImage(id: string, updates: UpdateImagePayload) {
            await ensureTable();
            const current = await fetchImage(id);
            if (!current) {
                throw new Error('Image not found');
            }
            const nextImage = mergeImageUpdates(current, updates);
            await sql`
                UPDATE proofy_images
                SET
                    url = ${nextImage.url},
                    blob_path = ${nextImage.blobPath ?? null},
                    width = ${nextImage.width ?? null},
                    height = ${nextImage.height ?? null},
                    bytes = ${nextImage.bytes ?? null},
                    mime_type = ${nextImage.mimeType ?? null},
                    placeholder = ${nextImage.placeholder ?? null},
                    store = ${nextImage.store},
                    date = ${nextImage.date},
                    week = ${nextImage.week},
                    tags = ${JSON.stringify(nextImage.tags)},
                    notes = ${nextImage.notes},
                    uploaded_at = ${nextImage.uploadedAt},
                    sort_key = ${nextImage.sortKey ?? null},
                    gps_latitude = ${nextImage.gps?.latitude ?? null},
                    gps_longitude = ${nextImage.gps?.longitude ?? null},
                    camera_make = ${nextImage.camera?.make ?? null},
                    camera_model = ${nextImage.camera?.model ?? null}
                WHERE id = ${id}
            `;
            return nextImage;
        },
        async deleteImage(id: string) {
            await ensureTable();
            const result = await sql`
                DELETE FROM proofy_images
                WHERE id = ${id}
                RETURNING *
            `;
            const row = result.rows[0];
            if (!row) {
                throw new Error('Image not found');
            }
            return mapRow(row);
        },
        async bulkCreateImages(payloads: NewImagePayload[]) {
            if (!payloads.length) return [];
            await ensureTable();
            const created: ImageMetadata[] = [];
            for (const payload of payloads) {
                const image = buildImageRecord(payload);
                await sql`
                    INSERT INTO proofy_images (
                        id,
                        url,
                        blob_path,
                        width,
                        height,
                        bytes,
                        mime_type,
                        placeholder,
                        store,
                        date,
                        week,
                        tags,
                        notes,
                        uploaded_at,
                        sort_key,
                        gps_latitude,
                        gps_longitude,
                        camera_make,
                        camera_model
                    )
                    VALUES (
                        ${image.id},
                        ${image.url},
                        ${image.blobPath ?? null},
                        ${image.width ?? null},
                        ${image.height ?? null},
                        ${image.bytes ?? null},
                        ${image.mimeType ?? null},
                        ${image.placeholder ?? null},
                        ${image.store},
                        ${image.date},
                        ${image.week},
                        ${JSON.stringify(image.tags)},
                        ${image.notes},
                        ${image.uploadedAt},
                        ${image.sortKey ?? null},
                        ${image.gps?.latitude ?? null},
                        ${image.gps?.longitude ?? null},
                        ${image.camera?.make ?? null},
                        ${image.camera?.model ?? null}
                    )
                `;
                created.push(image);
            }
            return created;
        },
    };
}



const adapter: StorageAdapter = (() => {
    // 1. Explicitly enabled via flag
    if (process.env.PROOFY_USE_POSTGRES === 'true') {
        if (!isPostgresAvailable()) {
            throw new Error(
                'PROOFY_USE_POSTGRES is true, but no Postgres URL was found. ' +
                'Please set POSTGRES_URL (or equivalent) in your environment variables.'
            );
        }
        return createPostgresAdapter();
    }

    // 2. Auto-detect: if URL is present, use it (safer for production)
    if (isPostgresAvailable()) {
        console.log('[Storage] Postgres URL detected, using Postgres adapter.');
        return createPostgresAdapter();
    }

    // 3. Fallback to file system (dev only, or if no DB)
    // In production (Vercel), this will likely fail with EROFS if they try to write.
    if (process.env.NODE_ENV === 'production') {
        console.warn(
            '[Storage] Using FileAdapter in production. Writes will fail (EROFS) in serverless environments. ' +
            'Set POSTGRES_URL to enable database storage.'
        );
    }
    return createFileAdapter();
})();

export async function getImages() {
    return adapter.getImages();
}

export async function getImageById(id: string) {
    return adapter.getImageById(id);
}

export async function createImage(payload: NewImagePayload) {
    return adapter.createImage(payload);
}

export async function updateImage(id: string, updates: UpdateImagePayload) {
    return adapter.updateImage(id, updates);
}

export async function deleteImage(id: string) {
    return adapter.deleteImage(id);
}

export async function bulkCreateImages(payloads: NewImagePayload[]) {
    return adapter.bulkCreateImages(payloads);
}
