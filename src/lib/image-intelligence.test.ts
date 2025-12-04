import { describe, expect, it } from 'vitest';

import { enhanceWithSmartMetadata, previewSmartTags } from './image-intelligence';
import { getWeekNumber } from './utils';
import { ImageMetadata } from '@/types';

describe('image-intelligence helpers', () => {
    it('enriches metadata with seasonal, weekly, and keyword tags', () => {
        const date = '2025-01-15T00:00:00.000Z';
        const base: ImageMetadata = {
            id: 'demo',
            url: 'https://example.com/img.jpg',
            store: 'Arcade Prime',
            date,
            week: getWeekNumber(date),
            tags: ['initial'],
            notes: 'Night display with neon promo signage.',
            uploadedAt: new Date().toISOString(),
        };

        const enriched = enhanceWithSmartMetadata(base);
        expect(enriched.tags).toEqual(
            expect.arrayContaining([
                'initial',
                'ARCADE_PRIME',
                `WEEK_${getWeekNumber(date)}`,
                'MONTH_JAN',
                'WINTER',
                'NIGHT',
                'LIGHTING',
                'DISPLAY',
                'PROMO',
                'SIGNAGE',
            ])
        );
    });

    it('previews smart tags for upload forms', () => {
        const preview = previewSmartTags({
            store: 'Neon Plaza',
            date: '2025-03-03',
            notes: 'clean entrance ready',
            tags: ['custom'],
        });

        expect(preview).toEqual(
            expect.arrayContaining(['custom', 'NEON_PLAZA', 'CLEAN', 'ENTRANCE'])
        );
    });
});
