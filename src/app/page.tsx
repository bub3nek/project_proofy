"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCcw } from 'lucide-react';

import { FilterOptions, ImageMetadata } from '@/types';
import { filterImages, getFilterCollections } from '@/lib/filter-images';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ImageGrid } from '@/components/Gallery/ImageGrid';
import { Lightbox } from '@/components/Gallery/Lightbox';
import { AutoFilterBar } from '@/components/Gallery/AutoFilterBar';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { formatDate } from '@/lib/utils';

export default function Home() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/images');
        const payload = (await response.json()) as ImageMetadata[];
        setImages(payload);
      } catch (error) {
        console.error('Failed to load gallery data', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchImages();
  }, []);

  const sortedImages = useMemo(() => {
    return [...images].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [images]);

  const filteredImages = useMemo(() => {
    return filterImages(sortedImages, filters);
  }, [sortedImages, filters]);

  const { stores, tags } = useMemo(() => getFilterCollections(sortedImages), [sortedImages]);

  const quickFilters = useMemo(() => {
    const storeCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    sortedImages.forEach((img) => {
      storeCounts.set(img.store, (storeCounts.get(img.store) || 0) + 1);
      img.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    const topStores = Array.from(storeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([store]) => store);
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
    return { topStores, topTags };
  }, [sortedImages]);

  const locationHighlights = useMemo(() => {
    return Array.from(new Set(sortedImages.map((img) => img.store))).slice(0, 5);
  }, [sortedImages]);

  const latestCapture = sortedImages[0];

  const handleStoreChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      stores: value ? [value] : undefined,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => {
      const current = prev.tags || [];
      const isActive = current.includes(tag);
      const nextTags = isActive ? current.filter((t) => t !== tag) : [...current, tag];
      return { ...prev, tags: nextTags.length ? nextTags : undefined };
    });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        start: type === 'start' ? value : prev.dateRange?.start || '',
        end: type === 'end' ? value : prev.dateRange?.end || '',
      },
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  };

  const resetFilters = () => setFilters({});

  return (
    <main className="immersive-bg min-h-screen px-4 py-12 md:py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        <section className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="holo-card p-6 space-y-6">
            <div className="flex items-center gap-4">
              <Image src="/brand-orbit.svg" alt="Project Proofy logo" width={72} height={72} priority />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--text-muted)]">Project Proofy</p>
                <h1 className="text-3xl text-glow-cyan">Live Evidence Board</h1>
                <p className="text-[var(--text-secondary)] text-xs uppercase tracking-[0.3em]">by Dmytro Usoltsev</p>
              </div>
            </div>

            <p className="text-[var(--text-secondary)] leading-relaxed">
              The gallery boots directly into filtering mode. Every capture is enriched with metadata, so locations,
              dates, and smart tags are auto-detected the moment a file leaves the admin deck.
            </p>

            <div className="space-y-4">
              <div>
                <label className="filter-label">Search notes & tags</label>
                <Input
                  placeholder="Type a keyword..."
                  value={filters.searchQuery || ''}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
              </div>
              <div>
                <label className="filter-label">Store location</label>
                <Select
                  value={filters.stores?.[0] || ''}
                  onChange={(event) => handleStoreChange(event.target.value)}
                  options={[
                    { value: '', label: 'ALL LOCATIONS' },
                    ...stores.map((store) => ({ value: store, label: store })),
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="filter-label">From</label>
                  <Input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(event) => handleDateChange('start', event.target.value)}
                  />
                </div>
                <div>
                  <label className="filter-label">To</label>
                  <Input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(event) => handleDateChange('end', event.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="filter-label flex items-center gap-2">
                  Auto tags from metadata
                  <span className="text-[10px] tracking-[0.3em] text-[var(--text-muted)]">auto</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 8).map((tag) => {
                    const isActive = filters.tags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 text-[10px] font-['VT323'] tracking-[0.2em] border transition-all ${
                          isActive
                            ? 'bg-[var(--neon-magenta)] text-black border-[var(--neon-magenta)]'
                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                  {!tags.length && <span className="text-[var(--text-muted)] text-xs">No tags detected yet.</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="button"
                variant="magenta"
                className="flex items-center gap-2 text-xs"
                onClick={resetFilters}
              >
                <RefreshCcw size={14} />
                RESET FILTERS
              </Button>
              <Link href="/admin" className="pixel-btn pixel-btn-cyan text-[10px] tracking-[0.35em]">
                ADMIN PANEL
              </Link>
            </div>

            <div className="pt-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">
                Active locations (auto)
              </p>
              <div className="signal-rail">
                {locationHighlights.length ? (
                  locationHighlights.map((loc) => <span key={loc}>{loc}</span>)
                ) : (
                  <span>Loading...</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">
                    Sorted newest ➜ latest
                  </p>
                  <h2 className="text-3xl text-glow-magenta">Gallery Stream</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Showing {filteredImages.length} of {sortedImages.length} captures
                  </p>
                </div>
                <Link href="/gallery" className="pixel-btn pixel-btn-cyan flex items-center gap-2 text-xs">
                  OPEN ARCHIVE
                  <ArrowRight size={14} />
                </Link>
              </div>

              {latestCapture && (
                <div className="holo-card p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative w-full md:w-48 h-40 border border-[var(--border-color)] overflow-hidden">
                    <ResponsiveImage
                      metadata={latestCapture}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 200px"
                    />
                  </div>
                  <div className="space-y-1 text-left w-full">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-muted)]">
                      Latest capture
                    </p>
                    <h3 className="text-xl text-glow-cyan">{latestCapture.store}</h3>
                    <p className="text-sm font-['VT323']">{formatDate(latestCapture.date)}</p>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                      {latestCapture.notes || 'Metadata enriched proof'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <AutoFilterBar
              stores={quickFilters.topStores}
              tags={quickFilters.topTags}
              onStoreSelect={(store) => setFilters((prev) => ({ ...prev, stores: [store] }))}
              onTagSelect={(tag) => setFilters((prev) => ({ ...prev, tags: [tag] }))}
              onReset={resetFilters}
            />

            <ImageGrid
              images={filteredImages}
              onImageClick={setSelectedImage}
              isLoading={isLoading}
            />
          </div>
        </section>
      </div>

      <Lightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
    </main>
  );
}
