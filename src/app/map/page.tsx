'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Image as ImageIcon, ArrowLeft, Camera, Calendar } from 'lucide-react';
import { ImageMetadata } from '@/types';
import { formatGPSCoordinates, getGoogleMapsUrl } from '@/lib/exif-extractor';
import { formatDate } from '@/lib/utils';

export default function MapPage() {
    const [images, setImages] = useState<ImageMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/images');
                const allImages = (await response.json()) as ImageMetadata[];

                // Filter images that have GPS coordinates
                const imagesWithGPS = allImages.filter(img => img.gps);
                setImages(imagesWithGPS);

                console.log(`[Map] Loaded ${imagesWithGPS.length} images with GPS data out of ${allImages.length} total`);
            } catch (error) {
                console.error('Failed to load image data', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-dark)]">
            {/* Header */}
            <header className="primary-header">
                <div className="primary-header__inner">
                    <Link href="/" className="flex items-center gap-2 text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition">
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Back to Home</span>
                    </Link>
                    <h1 className="text-lg font-semibold">Photo Map</h1>
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Page Header */}
                <div className="pixel-card mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin size={32} className="text-[var(--neon-cyan)]" />
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Photo Locations</h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                {images.length} {images.length === 1 ? 'photo' : 'photos'} with GPS coordinates
                            </p>
                        </div>
                    </div>

                    {images.length > 0 && (
                        <p className="text-sm text-[var(--text-secondary)]">
                            📍 Click on any photo to view its location on Google Maps
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="skeleton-card h-64" />
                        ))}
                    </div>
                ) : images.length === 0 ? (
                    /* Empty State */
                    <div className="pixel-card text-center py-16">
                        <MapPin size={64} className="mx-auto text-[var(--text-muted)] mb-6 opacity-50" />
                        <h3 className="text-2xl font-semibold mb-3">No GPS Data Found</h3>
                        <p className="text-[var(--text-muted)] mb-2 max-w-md mx-auto">
                            Upload photos with GPS metadata (location data) to see them on the map.
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mb-8 max-w-md mx-auto">
                            Most smartphones automatically save GPS coordinates when you take photos.
                        </p>
                        <Link href="/admin/upload" className="pixel-btn pixel-btn-cyan inline-block">
                            UPLOAD PHOTOS
                        </Link>
                    </div>
                ) : (
                    /* Photo Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="pixel-card hover:shadow-xl transition-all cursor-pointer"
                                onClick={() => setSelectedImage(selectedImage?.id === image.id ? null : image)}
                            >
                                {/* Image */}
                                <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 border border-[var(--border-color)]">
                                    <img
                                        src={image.url}
                                        alt={image.notes || 'Photo'}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                                    />
                                </div>

                                {/* Metadata */}
                                <div className="space-y-3">
                                    {/* Location */}
                                    {image.gps && (
                                        <div className="flex items-start gap-2">
                                            <MapPin size={16} className="text-[var(--neon-cyan)] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Location</p>
                                                <p className="text-sm font-mono text-[var(--color-text)] break-all">
                                                    {formatGPSCoordinates(image.gps)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Date */}
                                    <div className="flex items-start gap-2">
                                        <Calendar size={16} className="text-[var(--neon-cyan)] mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Date</p>
                                            <p className="text-sm text-[var(--color-text)]">
                                                {formatDate(image.date)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Camera */}
                                    {image.camera && (image.camera.make || image.camera.model) && (
                                        <div className="flex items-start gap-2">
                                            <Camera size={16} className="text-[var(--neon-cyan)] mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Camera</p>
                                                <p className="text-sm text-[var(--color-text)]">
                                                    {image.camera.make} {image.camera.model}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Store */}
                                    <div className="pt-2 border-t border-[var(--border-color)]">
                                        <span className="badge badge--primary text-xs">
                                            {image.store}
                                        </span>
                                    </div>

                                    {/* View on Map Button */}
                                    {image.gps && (
                                        <a
                                            href={getGoogleMapsUrl(image.gps)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="pixel-btn pixel-btn-cyan w-full text-center text-xs mt-3 inline-block"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            VIEW ON GOOGLE MAPS
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                {images.length > 0 && (
                    <div className="pixel-card mt-8 bg-[var(--color-primary-soft)] border-[var(--color-primary)]">
                        <h3 className="font-semibold text-[var(--color-primary)] mb-2">💡 About GPS Data</h3>
                        <p className="text-sm text-[var(--color-text)]">
                            GPS coordinates are automatically extracted from your photos' EXIF metadata.
                            Most smartphones save your location when you take photos (if location services are enabled).
                            Click "VIEW ON GOOGLE MAPS" to see the exact location where each photo was taken.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
