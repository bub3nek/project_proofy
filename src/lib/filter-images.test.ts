import { describe, expect, it } from 'vitest';

import { filterImages } from './filter-images';
import { FilterOptions, ImageMetadata } from '@/types';

const mockImages: ImageMetadata[] = [
    {
        id: '1',
        url: 'https://example.com/1.jpg',
        store: 'NEON',
        date: '2025-12-01',
        week: 49,
        tags: ['DISPLAY', 'WINDOW'],
        notes: 'Window display finished',
        uploadedAt: '2025-12-01T00:00:00.000Z',
    },
    {
        id: '2',
        url: 'https://example.com/2.jpg',
        store: 'CYBER',
        date: '2025-11-20',
        week: 47,
        tags: ['AISLE'],
        notes: 'Stock check completed',
        uploadedAt: '2025-11-20T00:00:00.000Z',
    },
    {
        id: '3',
        url: 'https://example.com/3.jpg',
        store: 'NEON',
        date: '2025-11-15',
        week: 46,
        tags: ['WINDOW', 'LIGHTING'],
        notes: 'Lighting test',
        uploadedAt: '2025-11-15T00:00:00.000Z',
    },
];

describe('filterImages', () => {
    it('returns all images when filters are empty', () => {
        const filtered = filterImages(mockImages, {});
        expect(filtered).toHaveLength(3);
    });

    it('filters by store', () => {
        const filters: FilterOptions = { stores: ['CYBER'] };
        const filtered = filterImages(mockImages, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('2');
    });

    it('filters by tag', () => {
        const filters: FilterOptions = { tags: ['WINDOW'] };
        const filtered = filterImages(mockImages, filters);
        expect(filtered).toHaveLength(2);
    });

    it('filters by date range', () => {
        const filters: FilterOptions = {
            dateRange: {
                start: '2025-11-16',
                end: '2025-12-31',
            },
        };
        const filtered = filterImages(mockImages, filters);
        expect(filtered).toHaveLength(2);
    });

    it('filters by search query', () => {
        const filters: FilterOptions = { searchQuery: 'lighting' };
        const filtered = filterImages(mockImages, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('3');
    });

    it('filters by week', () => {
        const filters: FilterOptions = { weeks: [47] };
        const filtered = filterImages(mockImages, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('2');
    });

    it('combines multiple filters', () => {
        const filters: FilterOptions = { stores: ['NEON'], tags: ['WINDOW'], searchQuery: 'display' };
        const filtered = filterImages(mockImages, filters);
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('1');
    });
});
