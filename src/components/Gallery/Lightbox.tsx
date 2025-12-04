import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (image) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
            document.body.classList.add('lightbox-open');
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
            document.body.classList.remove('lightbox-open');
        };
    }, [image, onClose]);

    if (!image || !isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[101]"
            >
                <X size={32} />
            </button>

            <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row gap-6 md:gap-8 overflow-hidden rounded-[32px] bg-[var(--bg-card)] border border-[var(--color-border)] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
                <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden rounded-[32px] md:rounded-[32px_0_0_32px]">
                    <div className="relative w-full h-full min-h-[320px] md:min-h-[400px] max-h-[65vh]">
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

                <div className="w-full md:w-[360px] flex flex-col p-6 space-y-6 overflow-y-auto bg-[var(--bg-card)] border-l border-[var(--border-color)]">
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
        </div>,
        document.body
    );
}
