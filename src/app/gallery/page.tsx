"use client";

import { useState, useMemo, useEffect, useDeferredValue } from "react";
import { FilterSidebar } from "@/components/Gallery/FilterSidebar";
import { ImageGrid } from "@/components/Gallery/ImageGrid";
import { SearchBar } from "@/components/Gallery/SearchBar";
import { Lightbox } from "@/components/Gallery/Lightbox";
import { Button } from "@/components/ui/Button";
import { FilterOptions, ImageMetadata } from "@/types";
import { Filter as FilterIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { filterImages, getFilterCollections } from "@/lib/filter-images";

export default function GalleryPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
    const [filters, setFilters] = useState<FilterOptions>({});
    const deferredFilters = useDeferredValue(filters);
    const [images, setImages] = useState<ImageMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch images
    useEffect(() => {
        async function fetchImages() {
            try {
                const res = await fetch('/api/images');
                const data = await res.json();
                setImages(data);
            } catch (error) {
                console.error('Failed to fetch images:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchImages();
    }, []);

    const { stores, tags } = useMemo(() => getFilterCollections(images), [images]);

    const filteredImages = useMemo(() => {
        return filterImages(images, deferredFilters);
    }, [images, deferredFilters]);

    return (
        <div className="min-h-screen bg-[var(--bg-dark)]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[var(--bg-dark)]/90 backdrop-blur-md border-b-2 border-[var(--border-color)]">
                <div className="max-w-[1600px] mx-auto px-4 h-20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="pixel-btn pixel-btn-cyan hidden md:flex items-center gap-2 py-2 px-4 text-xs">
                            <ArrowLeft size={14} /> BACK
                        </Link>
                        <h1 className="text-xl md:text-2xl text-glow-cyan truncate">
                            ARCHIVE GALLERY
                        </h1>
                    </div>

                    <div className="flex-1 max-w-xl flex items-center justify-end gap-4">
                        <SearchBar
                            value={filters.searchQuery || ''}
                            onChange={(value) => setFilters(prev => ({ ...prev, searchQuery: value }))}
                        />
                        <Button
                            variant="magenta"
                            className="lg:hidden p-3"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <FilterIcon size={20} />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex max-w-[1600px] mx-auto">
                {/* Sidebar */}
                <FilterSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    filters={filters}
                    onFilterChange={setFilters}
                    stores={stores}
                    tags={tags}
                />

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 min-h-[calc(100vh-5rem)]">
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-[var(--text-secondary)] font-['VT323'] text-xl">
                            SHOWING {filteredImages.length} RECORDS
                        </p>
                    </div>

                    <ImageGrid
                        images={filteredImages}
                        onImageClick={setSelectedImage}
                        isLoading={isLoading}
                    />
                </main>
            </div>

            {/* Lightbox */}
            <Lightbox
                image={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div>
    );
}
