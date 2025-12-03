import { ImageMetadata } from '@/types';
import { getWeekNumber } from './utils';

const keywordMap: Record<string, string> = {
    night: 'NIGHT',
    evening: 'NIGHT',
    neon: 'LIGHTING',
    light: 'LIGHTING',
    window: 'WINDOW',
    display: 'DISPLAY',
    promo: 'PROMO',
    sale: 'PROMO',
    stock: 'STOCK',
    clean: 'CLEAN',
    signage: 'SIGNAGE',
    server: 'SERVER',
    entrance: 'ENTRANCE',
    aisle: 'AISLE',
};

const seasonMap: Record<number, string> = {
    0: 'WINTER',
    1: 'WINTER',
    2: 'SPRING',
    3: 'SPRING',
    4: 'SPRING',
    5: 'SUMMER',
    6: 'SUMMER',
    7: 'SUMMER',
    8: 'FALL',
    9: 'FALL',
    10: 'FALL',
    11: 'WINTER',
};

function canonicalTag(value?: string) {
    if (!value) return '';
    return value.trim().toUpperCase().replace(/\s+/g, '_');
}

function deriveSeason(date?: string) {
    if (!date) return null;
    const month = new Date(date).getMonth();
    return seasonMap[month] || null;
}

function deriveMonth(date?: string) {
    if (!date) return null;
    const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
    return `MONTH_${formatter.format(new Date(date)).toUpperCase()}`;
}

function keywordTags(notes?: string) {
    if (!notes) return [];
    const tags = new Set<string>();
    const lower = notes.toLowerCase();
    Object.entries(keywordMap).forEach(([keyword, tag]) => {
        if (lower.includes(keyword)) {
            tags.add(tag);
        }
    });
    return Array.from(tags);
}

export function enhanceWithSmartMetadata(image: ImageMetadata) {
    const tags = new Set(image.tags || []);
    tags.add(canonicalTag(image.store));
    tags.add(`WEEK_${image.week}`);
    const monthTag = deriveMonth(image.date);
    if (monthTag) tags.add(monthTag);
    const seasonTag = deriveSeason(image.date);
    if (seasonTag) tags.add(seasonTag);
    keywordTags(image.notes).forEach((tag) => tags.add(tag));

    return {
        ...image,
        tags: Array.from(tags),
        sortKey: new Date(image.date).getTime(),
    };
}

interface SmartPreviewInput {
    store?: string;
    date?: string;
    notes?: string;
    tags?: string[];
}

export function previewSmartTags(input: SmartPreviewInput) {
    const week = input.date ? getWeekNumber(input.date) : null;
    const image: ImageMetadata = {
        id: 'preview',
        url: '',
        store: input.store || 'STORE',
        date: input.date || new Date().toISOString(),
        week: week || getWeekNumber(new Date()),
        tags: input.tags || [],
        notes: input.notes || '',
        uploadedAt: new Date().toISOString(),
        sortKey: Date.now(),
    };
    return enhanceWithSmartMetadata(image).tags;
}
