import { FilterOptions, ImageMetadata } from '@/types';

export function filterImages(images: ImageMetadata[], filters: FilterOptions) {
    const result = images.filter((img) => {
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matches =
                img.store.toLowerCase().includes(query) ||
                img.notes.toLowerCase().includes(query) ||
                img.tags.some((tag) => tag.toLowerCase().includes(query));

            if (!matches) {
                return false;
            }
        }

        if (filters.stores?.length && !filters.stores.includes(img.store)) {
            return false;
        }

        if (filters.dateRange?.start && img.date < filters.dateRange.start) {
            return false;
        }

        if (filters.dateRange?.end && img.date > filters.dateRange.end) {
            return false;
        }

        if (filters.weeks?.length && !filters.weeks.includes(img.week)) {
            return false;
        }

        if (filters.tags?.length) {
            const hasTag = filters.tags.some((tag) => img.tags.includes(tag));
            if (!hasTag) {
                return false;
            }
        }

        return true;
    });

    return result.sort((a, b) => {
        const sortA = a.sortKey ?? new Date(a.date).getTime();
        const sortB = b.sortKey ?? new Date(b.date).getTime();
        return sortB - sortA;
    });
}

export function getFilterCollections(images: ImageMetadata[]) {
    const stores = new Set<string>();
    const tags = new Set<string>();

    images.forEach((img) => {
        stores.add(img.store);
        img.tags.forEach((tag) => tags.add(tag));
    });

    return {
        stores: Array.from(stores).sort(),
        tags: Array.from(tags).sort(),
    };
}
