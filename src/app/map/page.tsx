'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { ImageMetadata } from '@/types';

interface StoreLocation {
    name: string;
    count: number;
    images: ImageMetadata[];
}

export default function MapPage() {
    const [stores, setStores] = useState<StoreLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/images');
                const images = (await response.json()) as ImageMetadata[];

                // Group images by store
                const storeMap = new Map<string, ImageMetadata[]>();
                images.forEach((img) => {
                    const storeName = img.store || 'UNKNOWN';
                    if (!storeMap.has(storeName)) {
                        storeMap.set(storeName, []);
                    }
                    storeMap.get(storeName)!.push(img);
                });

                // Convert to array and sort by count
                const storeLocations: StoreLocation[] = Array.from(storeMap.entries())
                    .map(([name, imgs]) => ({
                        name,
                        count: imgs.length,
                        images: imgs,
                    }))
                    .sort((a, b) => b.count - a.count);

                setStores(storeLocations);
            } catch (error) {
                console.error('Failed to load store data', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const selectedStoreData = stores.find((s) => s.name === selectedStore);

    return (
        <div className="min-h-screen bg-[var(--bg-dark)]">
            {/* Header */}
            <header className="primary-header">
                <div className="primary-header__inner">
                    <Link href="/" className="flex items-center gap-2 text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition">
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Back to Home</span>
                    </Link>
                    <h1 className="text-lg font-semibold">Store Map</h1>
                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
                {/* Page Header */}
                <div className="pixel-card mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin size={32} className="text-[var(--neon-cyan)]" />
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Store Locations</h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                {stores.length} locations • {stores.reduce((sum, s) => sum + s.count, 0)} total images
                            </p>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="skeleton-card h-48" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Store Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {stores.map((store) => (
                                <button
                                    key={store.name}
                                    onClick={() => setSelectedStore(selectedStore === store.name ? null : store.name)}
                                    className={`pixel-card text-left transition-all ${selectedStore === store.name
                                            ? 'ring-2 ring-[var(--neon-cyan)] bg-[var(--color-primary-soft)]'
                                            : 'hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={24} className="text-[var(--neon-cyan)]" />
                                            <h3 className="font-bold text-lg">{store.name}</h3>
                                        </div>
                                        {selectedStore === store.name && (
                                            <span className="text-xs text-[var(--neon-cyan)] uppercase tracking-wider">Selected</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                        <ImageIcon size={16} />
                                        <span>{store.count} {store.count === 1 ? 'image' : 'images'}</span>
                                    </div>

                                    {/* Preview thumbnails */}
                                    {store.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-4 gap-2">
                                            {store.images.slice(0, 4).map((img, idx) => (
                                                <div
                                                    key={img.id}
                                                    className="aspect-square rounded-lg overflow-hidden border border-[var(--border-color)]"
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Selected Store Details */}
                        {selectedStoreData && (
                            <div className="pixel-card">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--color-text)]">{selectedStoreData.name}</h3>
                                        <p className="text-sm text-[var(--text-muted)]">
                                            {selectedStoreData.count} {selectedStoreData.count === 1 ? 'image' : 'images'}
                                        </p>
                                    </div>
                                    <Link
                                        href={`/gallery?store=${encodeURIComponent(selectedStoreData.name)}`}
                                        className="pixel-btn pixel-btn-cyan text-xs"
                                    >
                                        VIEW ALL
                                    </Link>
                                </div>

                                {/* Image Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {selectedStoreData.images.slice(0, 12).map((img) => (
                                        <Link
                                            key={img.id}
                                            href={`/gallery?store=${encodeURIComponent(selectedStoreData.name)}`}
                                            className="aspect-square rounded-lg overflow-hidden border border-[var(--border-color)] hover:ring-2 hover:ring-[var(--neon-cyan)] transition-all"
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.notes || 'Gallery image'}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                            />
                                        </Link>
                                    ))}
                                </div>

                                {selectedStoreData.images.length > 12 && (
                                    <div className="mt-4 text-center">
                                        <Link
                                            href={`/gallery?store=${encodeURIComponent(selectedStoreData.name)}`}
                                            className="text-sm text-[var(--neon-cyan)] hover:underline"
                                        >
                                            +{selectedStoreData.images.length - 12} more images
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty State */}
                        {stores.length === 0 && (
                            <div className="pixel-card text-center py-12">
                                <MapPin size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                                <h3 className="text-xl font-semibold mb-2">No Stores Yet</h3>
                                <p className="text-[var(--text-muted)] mb-6">
                                    Upload some images to see store locations here
                                </p>
                                <Link href="/admin/upload" className="pixel-btn pixel-btn-cyan">
                                    UPLOAD IMAGES
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
