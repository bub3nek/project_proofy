import { ImageMetadata } from '@/types';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { ResponsiveImage } from '@/components/ResponsiveImage';

interface ImageGridProps {
    images: ImageMetadata[];
    onImageClick: (image: ImageMetadata) => void;
    isLoading?: boolean;
}

function groupImages(images: ImageMetadata[]) {
    const byStore = new Map<string, Map<string, ImageMetadata[]>>();

    images.forEach((image) => {
        const storeKey = image.store || 'UNKNOWN LOCATION';
        const dateKey = image.date;

        if (!byStore.has(storeKey)) {
            byStore.set(storeKey, new Map());
        }
        const dateMap = byStore.get(storeKey)!;
        if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, []);
        }
        dateMap.get(dateKey)!.push(image);
    });

    return Array.from(byStore.entries())
        .map(([store, dateMap]) => {
            const dates = Array.from(dateMap.entries())
                .map(([date, items]) => ({
                    date,
                    images: items.sort(
                        (a, b) =>
                            (b.sortKey ?? new Date(b.date).getTime()) -
                            (a.sortKey ?? new Date(a.date).getTime())
                    ),
                }))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return {
                store,
                total: dates.reduce((acc, entry) => acc + entry.images.length, 0),
                dates,
            };
        })
        .sort((a, b) => {
            const latestA = a.dates[0]?.images[0];
            const latestB = b.dates[0]?.images[0];
            const sortA = latestA ? latestA.sortKey ?? new Date(latestA.date).getTime() : 0;
            const sortB = latestB ? latestB.sortKey ?? new Date(latestB.date).getTime() : 0;
            return sortB - sortA;
        });
}

export function ImageGrid({ images, onImageClick, isLoading = false }: ImageGridProps) {
    if (isLoading) {
        return (
            <div className="gallery-grid">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="skeleton-card"
                    />
                ))}
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                <AlertCircle size={48} className="mb-4 text-[var(--neon-magenta)]" />
                <h3 className="text-xl font-['Press_Start_2P'] mb-2">NO DATA FOUND</h3>
                <p className="font-['VT323'] text-xl">Try adjusting your filters or search query</p>
            </div>
        );
    }

    const groups = groupImages(images);

    return (
        <div className="gallery-groups">
            {groups.map((group) => (
                <section key={group.store} className="gallery-group">
                    <div className="gallery-group__header">
                        <div>
                            <p className="gallery-group__label">Store / Location</p>
                            <h3>{group.store}</h3>
                        </div>
                        <span className="gallery-group__total">{group.total} captures</span>
                    </div>

                    <div className="gallery-group__dates">
                        {group.dates.map((entry) => (
                            <div key={`${group.store}-${entry.date}`} className="gallery-date-card">
                                <div className="gallery-date-card__meta">
                                    <div>
                                        <p className="gallery-group__label">Date</p>
                                        <p className="gallery-date-card__heading">{formatDate(entry.date)}</p>
                                    </div>
                                    <span className="gallery-date-card__count">
                                        {entry.images.length} {entry.images.length === 1 ? 'photo' : 'photos'}
                                    </span>
                                </div>

                                <div className="gallery-date-card__grid">
                                    {entry.images.map((image, index) => (
                                        <motion.button
                                            key={image.id}
                                            type="button"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.04, duration: 0.3 }}
                                            className="gallery-thumb"
                                            onClick={() => onImageClick(image)}
                                        >
                                            <ResponsiveImage
                                                metadata={image}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 240px"
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
