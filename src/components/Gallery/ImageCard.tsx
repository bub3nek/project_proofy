import { Calendar, Store } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate } from '@/lib/utils';
import { ImageMetadata } from '@/types';
import { ResponsiveImage } from '../ResponsiveImage';

interface ImageCardProps {
    image: ImageMetadata;
    onClick: (image: ImageMetadata) => void;
}

export function ImageCard({ image, onClick }: ImageCardProps) {
    return (
        <Card
            className="group cursor-pointer overflow-hidden p-0 border-2 hover:border-[var(--neon-cyan)] transition-all duration-300"
            onClick={() => onClick(image)}
        >
            <div className="relative aspect-square w-full overflow-hidden">
                <ResponsiveImage
                    metadata={image}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 pixel-perfect"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Hover Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm line-clamp-2 font-['VT323']">
                        {image.notes}
                    </p>
                </div>
            </div>

            <div className="p-4 space-y-3 bg-[var(--bg-card)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--neon-cyan)]">
                        <Store size={14} />
                        <span className="text-xs font-['Press_Start_2P'] truncate max-w-[120px]">
                            {image.store}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Calendar size={14} />
                        <span className="text-sm font-['VT323']">
                            {formatDate(image.date)}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {image.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="magenta" className="text-[10px] py-1 px-2">
                            {tag}
                        </Badge>
                    ))}
                    {image.tags.length > 3 && (
                        <Badge variant="cyan" className="text-[10px] py-1 px-2">
                            +{image.tags.length - 3}
                        </Badge>
                    )}
                </div>
            </div>
        </Card>
    );
}
