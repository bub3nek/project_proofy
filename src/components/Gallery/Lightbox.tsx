'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, ChevronDown } from 'lucide-react';
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
        if (typeof document === 'undefined') {
            return undefined;
        }

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

    if (!image || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 text-white/70 hover:text-white transition-colors z-[102] p-2 rounded-full hover:bg-white/10"
                aria-label="Close"
            >
                <X size={32} />
            </button>

            {/* Scrollable Container */}
            <div className="h-full overflow-y-auto snap-y snap-mandatory">
                {/* Full-Screen Image Section */}
                <section className="min-h-screen w-full flex flex-col items-center justify-center snap-start relative px-4 md:px-8">
                    <div className="relative w-full h-screen flex items-center justify-center">
                        <ResponsiveImage
                            metadata={image}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                            quality={95}
                        />
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-bounce">
                        <span className="text-xs uppercase tracking-wider font-['VT323'] text-sm">Scroll for details</span>
                        <ChevronDown size={24} />
                    </div>
                </section>

                {/* Details Section */}
                <section className="min-h-screen w-full snap-start bg-[var(--bg-dark)] flex items-center justify-center px-4 py-16">
                    <div className="max-w-4xl w-full">
                        <div className="pixel-card p-8 md:p-12 space-y-8">
                            {/* Header */}
                            <div>
                                <h2 className="text-3xl md:text-4xl font-['Press_Start_2P'] text-[var(--neon-cyan)] mb-6 leading-relaxed">
                                    {image.store}
                                </h2>
                                <div className="flex items-center gap-3 text-[var(--text-secondary)] font-['VT323'] text-2xl">
                                    <Calendar size={20} />
                                    <span>{formatDate(image.date)}</span>
                                    <span className="text-[var(--text-muted)]">•</span>
                                    <span>Week {image.week}</span>
                                </div>
                            </div>

                            <div className="neon-divider" />

                            {/* Notes */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-['Press_Start_2P'] text-[var(--neon-magenta)] mb-3">
                                    NOTES
                                </h3>
                                <p className="font-['VT323'] text-xl text-[var(--text-primary)] leading-relaxed">
                                    {image.notes || 'No notes available.'}
                                </p>
                            </div>

                            {/* Tags */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-['Press_Start_2P'] text-[var(--neon-purple)] mb-3">
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

                            {/* GPS Info (if available) */}
                            {image.gps && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-['Press_Start_2P'] text-[var(--neon-green)] mb-3">
                                        LOCATION
                                    </h3>
                                    <p className="font-['VT323'] text-lg text-[var(--text-secondary)]">
                                        {image.gps.latitude.toFixed(6)}°, {image.gps.longitude.toFixed(6)}°
                                    </p>
                                    <a
                                        href={`https://www.google.com/maps?q=${image.gps.latitude},${image.gps.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="pixel-btn pixel-btn-cyan text-xs inline-block"
                                    >
                                        VIEW ON GOOGLE MAPS
                                    </a>
                                </div>
                            )}

                            {/* Camera Info (if available) */}
                            {image.camera && (image.camera.make || image.camera.model) && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-['Press_Start_2P'] text-[var(--neon-yellow)] mb-3">
                                        CAMERA
                                    </h3>
                                    <p className="font-['VT323'] text-lg text-[var(--text-secondary)]">
                                        {image.camera.make} {image.camera.model}
                                    </p>
                                </div>
                            )}

                            <div className="neon-divider" />

                            {/* Metadata */}
                            <div className="text-[var(--text-muted)] text-sm font-['VT323'] space-y-1">
                                <p>ID: {image.id}</p>
                                <p>UPLOADED: {formatDate(image.uploadedAt)}</p>
                                {image.width && image.height && (
                                    <p>DIMENSIONS: {image.width} × {image.height}px</p>
                                )}
                                {image.bytes && (
                                    <p>SIZE: {(image.bytes / 1024 / 1024).toFixed(2)} MB</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>,
        document.body
    );
}
