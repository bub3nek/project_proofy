import { ImageMetadata } from '@/types';
import { ImageCard } from './ImageCard';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageGridProps {
    images: ImageMetadata[];
    onImageClick: (image: ImageMetadata) => void;
    isLoading?: boolean;
}

export function ImageGrid({ images, onImageClick, isLoading = false }: ImageGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square bg-[var(--bg-card)] animate-pulse border-2 border-[var(--border-color)]"
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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {images.map((image, index) => (
                <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="h-full"
                >
                    <ImageCard
                        image={image}
                        onClick={onImageClick}
                    />
                </motion.div>
            ))}
        </div>
    );
}
