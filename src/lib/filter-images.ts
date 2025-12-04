import { FilterOptions, ImageMetadata } from '@/types';

export function filterImages(images: ImageMetadata[], filters: FilterOptions) {
    const query = filters.searchQuery?.trim().toLowerCase();
    const storeFilters = filters.stores?.map((store) => store.toLowerCase());
    const tagFilters = filters.tags?.map((tag) => tag.toLowerCase());
    const startTime = filters.dateRange?.start ? new Date(filters.dateRange.start).getTime() : undefined;
    const endTime = filters.dateRange?.end ? new Date(filters.dateRange.end).getTime() : undefined;

    const result = images.filter((img) => {
        const imageStore = img.store.toLowerCase();
        const imageNotes = (img.notes || '').toLowerCase();
        const imageTags = (img.tags || []).map((tag) => tag.toLowerCase());
        const imageDate = new Date(img.date).getTime();

        if (query) {
            const matches =
                imageStore.includes(query) ||
                imageNotes.includes(query) ||
                imageTags.some((tag) => tag.includes(query));

            if (!matches) {
                return false;
            }
        }

        if (storeFilters?.length && !storeFilters.includes(imageStore)) {
            return false;
        }

        if (typeof startTime === 'number' && imageDate < startTime) {
            return false;
        }

        if (typeof endTime === 'number' && imageDate > endTime) {
            return false;
        }

        if (filters.weeks?.length && !filters.weeks.includes(img.week)) {
            return false;
        }

        if (tagFilters?.length) {
            const hasTag = tagFilters.some((tag) => imageTags.includes(tag));
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
