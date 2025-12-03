import { useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { ImageMetadata } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '../ui/Badge';
import { ResponsiveImage } from '../ResponsiveImage';

interface LightboxProps {
    image: ImageMetadata | null;
    onClose: () => void;
}

export function Lightbox({ image, onClose }: LightboxProps) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (image) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [image, onClose]);

    if (!image) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--neon-cyan)] transition-colors z-50"
            >
                <X size={32} />
            </button>

            <div className="relative w-full max-w-6xl h-full flex flex-col md:flex-row gap-6 md:gap-8 overflow-hidden rounded-lg bg-[var(--bg-card)] border-2 border-[var(--neon-cyan)] shadow-[0_0_50px_rgba(0,255,255,0.1)]">
                {/* Image Section */}
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full min-h-[300px] md:min-h-full">
                        <ResponsiveImage
                            metadata={image}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                            quality={90}
                        />
                    </div>
                </div>

                {/* Metadata Section */}
                <div className="w-full md:w-96 flex flex-col p-6 space-y-6 overflow-y-auto bg-[var(--bg-card)] border-l-0 md:border-l-2 border-[var(--border-color)]">
                    <div>
                        <h2 className="text-xl font-['Press_Start_2P'] text-[var(--neon-cyan)] mb-4 leading-relaxed">
                            {image.store}
                        </h2>
                        <div className="flex items-center gap-2 text-[var(--text-secondary)] font-['VT323'] text-xl">
                            <Calendar size={18} />
                            <span>{formatDate(image.date)}</span>
                            <span className="text-[var(--text-muted)]">•</span>
                            <span>Week {image.week}</span>
                        </div>
                    </div>

                    <div className="neon-divider my-4" />

                    <div className="space-y-2">
                        <h3 className="text-sm font-['Press_Start_2P'] text-[var(--neon-magenta)] mb-2">
                            NOTES
                        </h3>
                        <p className="font-['VT323'] text-xl text-[var(--text-primary)] leading-relaxed">
                            {image.notes || 'No notes available.'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-['Press_Start_2P'] text-[var(--neon-purple)] mb-2">
                            TAGS
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {image.tags.map((tag) => (
                                <Badge key={tag} variant="cyan">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 text-[var(--text-muted)] text-sm font-['VT323']">
                        ID: {image.id}
                        <br />
                        UPLOADED: {formatDate(image.uploadedAt)}
                    </div>
                </div>
            </div>
        </div>
    );
}
