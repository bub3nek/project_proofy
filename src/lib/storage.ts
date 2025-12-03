import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { ImageMetadata, NewImagePayload, UpdateImagePayload } from '@/types';
import { getWeekNumber } from './utils';
import { enhanceWithSmartMetadata } from './image-intelligence';

const DATA_FILE = path.join(process.cwd(), 'data', 'images.json');

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
    };
    return enhanceWithSmartMetadata(base);
}

export async function getImages() {
    const images = (await readImages()).map(enhanceWithSmartMetadata);
    return images.sort((a, b) => {
        const sortA = a.sortKey ?? new Date(a.date).getTime();
        const sortB = b.sortKey ?? new Date(b.date).getTime();
        return sortB - sortA;
    });
}

export async function getImageById(id: string) {
    const images = await readImages();
    return images.find((img) => img.id === id);
}

export async function createImage(payload: NewImagePayload) {
    const images = await readImages();
    const image = buildImageRecord(payload);
    const updated = [image, ...images];
    await writeImages(updated);
    return image;
}

export async function updateImage(id: string, updates: UpdateImagePayload) {
    const images = await readImages();
    const index = images.findIndex((img) => img.id === id);

    if (index === -1) {
        throw new Error('Image not found');
    }

    const current = images[index];
    const nextDate = updates.date ?? current.date;
    const nextImage: ImageMetadata = enhanceWithSmartMetadata({
        ...current,
        ...updates,
        date: nextDate,
        week: getWeekNumber(nextDate),
        tags: updates.tags ? normalizeTags(updates.tags) : current.tags,
    });

    images[index] = nextImage;
    await writeImages(images);
    return nextImage;
}

export async function deleteImage(id: string) {
    const images = await readImages();
    const index = images.findIndex((img) => img.id === id);

    if (index === -1) {
        throw new Error('Image not found');
    }

    const [removed] = images.splice(index, 1);
    await writeImages(images);
    return removed;
}

export async function bulkCreateImages(payloads: NewImagePayload[]) {
    if (!payloads.length) return [];
    const images = await readImages();
    const newRecords = payloads.map(buildImageRecord);
    const updated = [...newRecords, ...images];
    await writeImages(updated);
    return newRecords;
}
