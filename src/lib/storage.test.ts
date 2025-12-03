import { describe, expect, it, beforeEach, vi } from 'vitest';

import { bulkCreateImages, createImage, deleteImage, getImages, updateImage } from './storage';

const fileStore: Record<string, string> = {};

vi.mock('node:fs', () => {
    return {
        promises: {
            readFile: vi.fn(async (path: string) => {
                if (!(path in fileStore)) {
                    const error = new Error('ENOENT') as NodeJS.ErrnoException;
                    error.code = 'ENOENT';
                    throw error;
                }
                return fileStore[path];
            }),
            writeFile: vi.fn(async (path: string, content: string) => {
                fileStore[path] = content;
            }),
        },
    };
});

beforeEach(() => {
    for (const key of Object.keys(fileStore)) {
        delete fileStore[key];
    }
});

describe('storage', () => {
    it('creates and retrieves an image', async () => {
        const created = await createImage({
            url: 'https://example.com/image.jpg',
            store: 'Demo Store',
            date: '2025-12-04',
            tags: ['demo'],
            notes: 'Sample upload',
        });

        expect(created.id).toBeDefined();
        expect(created.week).toBeGreaterThan(0);

        const all = await getImages();
        expect(all).toHaveLength(1);
        expect(all[0].store).toBe('DEMO STORE');
    });

    it('updates image metadata and recalculates week', async () => {
        const [created] = await bulkCreateImages([
            {
                url: 'https://example.com/1.jpg',
                store: 'Alpha',
                date: '2025-01-01',
                tags: ['alpha'],
                notes: 'note',
            },
        ]);

        const updated = await updateImage(created.id, {
            date: '2025-02-01',
            tags: ['beta', 'gamma'],
            notes: 'Updated note',
        });

        expect(updated.week).not.toBe(created.week);
        expect(updated.tags).toEqual(expect.arrayContaining(['BETA', 'GAMMA']));
        expect(updated.notes).toBe('Updated note');
    });

    it('deletes images', async () => {
        const [created] = await bulkCreateImages([
            {
                url: 'https://example.com/1.jpg',
                store: 'Alpha',
                date: '2025-01-01',
                tags: ['alpha'],
                notes: 'note',
            },
        ]);

        await deleteImage(created.id);
        const all = await getImages();
        expect(all).toHaveLength(0);
    });
});
