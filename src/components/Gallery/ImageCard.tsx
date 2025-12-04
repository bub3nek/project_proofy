import { Calendar, MapPin } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import { ImageMetadata } from '@/types';
import { ResponsiveImage } from '../ResponsiveImage';

interface ImageCardProps {
    image: ImageMetadata;
    onClick: (image: ImageMetadata) => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
    return (
        <button
            type="button"
            onClick={() => onClick(image)}
            className="image-card text-left group cursor-pointer h-full"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <ResponsiveImage
                    metadata={image}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            <div className="image-card__meta">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-[var(--color-primary)]">
                        <MapPin size={16} />
                        <span className="text-sm font-semibold tracking-wide">
                            {image.store || 'Unknown location'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
                        <Calendar size={14} />
                        <span>{formatDate(image.date)}</span>
                    </div>
                </div>

                {image.notes && (
                    <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                        {image.notes}
                    </p>
                )}

                <div className="flex flex-wrap gap-2">
                    {image.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge badge--primary">
                            #{tag}
                        </span>
                    ))}
                    {image.tags.length > 3 && (
                        <span className="badge badge--success">+{image.tags.length - 3}</span>
                    )}
                </div>
            </div>
        </button>
    );
}
