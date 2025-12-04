"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';

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
  const [isPageReady, setIsPageReady] = useState(false);

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
  const featuredImages = sortedImages.slice(0, 4);
  const heroStats = [
    { label: 'Captures tracked', value: sortedImages.length.toString() },
    { label: 'Stores monitored', value: new Set(sortedImages.map((img) => img.store)).size.toString() },
    { label: 'Smart tags', value: new Set(sortedImages.flatMap((img) => img.tags)).size.toString() },
  ];
  const highlightTags = tags.slice(0, 6);

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

  useEffect(() => {
    const handleReady = () => setIsPageReady(true);
    window.addEventListener('proofy-app-ready', handleReady);
    const fallback = setTimeout(() => setIsPageReady(true), 1500);
    return () => {
      window.removeEventListener('proofy-app-ready', handleReady);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <>
      <header className="primary-header">
        <div className="primary-header__inner">
          <div className="flex items-center gap-3">
            <Image src="/brand-orbit.svg" alt="Proofy orbit" width={42} height={42} priority />
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-[var(--color-text-muted)]">Project Proofy</p>
              <p className="font-semibold text-[var(--color-text)] text-sm tracking-wide">by Dmytro Usoltsev</p>
            </div>
          </div>
          <nav className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/admin/upload">Upload</Link>
          </nav>
          <Link href="/gallery" className="pixel-btn pixel-btn-cyan text-[0.6rem]">VIEW ARCHIVE</Link>
        </div>
      </header>
      <main className={`immersive-bg min-h-screen px-4 py-12 md:py-16 page-transition ${isPageReady ? 'ready' : ''}`}>
        <div className="max-w-6xl mx-auto space-y-10">
          <section className="hero-layout relative">
            <div className="floating-lines" />
            <motion.div
              className="hero-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Project Proofy</p>
              <h1 className="text-4xl md:text-5xl text-[var(--color-text)] leading-tight">
                A visual heartbeat for every store.
              </h1>
              <p className="text-[var(--text-secondary)] text-lg">
                Uploads, metadata, and references stay perfectly in sync. Browse proof, spot gaps, and brief teams
                without leaving this page.
              </p>
              <div className="flex flex-wrap gap-3 pt-3">
                <Link href="/gallery" className="pixel-btn pixel-btn-cyan">View gallery</Link>
                <Link href="/admin" className="pixel-btn pixel-btn-magenta">Admin console</Link>
              </div>
              <div className="hero-stats-grid">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="stat-pill">
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">{stat.label}</p>
                    <p className="text-2xl font-semibold text-[var(--color-primary)]">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="signal-rail">
                {locationHighlights.map((loc) => (
                  <span key={loc}>{loc}</span>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="hero-media space-y-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {latestCapture && (
                <div className="pixel-card p-4 flex flex-col gap-3">
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-[var(--color-border)]">
                    <ResponsiveImage metadata={latestCapture} fill className="object-cover" sizes="(max-width:768px) 100vw, 400px" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Latest capture</p>
                    <h3 className="text-xl text-[var(--color-text)]">{latestCapture.store}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{formatDate(latestCapture.date)}</p>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{latestCapture.notes || 'Fresh metadata synced from the admin deck.'}</p>
                  </div>
                </div>
              )}
              {featuredImages.length > 0 && (
                <div className="featured-grid">
                  {featuredImages.map((img) => (
                    <div key={img.id} className="featured-grid__item" onClick={() => setSelectedImage(img)}>
                      <ResponsiveImage metadata={img} fill className="object-cover cursor-pointer" sizes="120px" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </section>

          <section className="pixel-card space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Filter the proof</p>
              <h3 className="text-2xl text-[var(--color-text)]">Instant metadata controls</h3>
            </div>
            <div className="control-grid">
              <div className="control-grid__full">
                <label className="filter-label">Search notes & tags</label>
                <Input
                  placeholder="Type a keyword..."
                  value={filters.searchQuery || ''}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
              </div>
              <div className="control-grid__full">
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
              <div className="control-grid__dates">
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
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)] mb-3">
                Auto tags from metadata
              </p>
              <div className="filters-dock">
                {highlightTags.length ? (
                  highlightTags.map((tag) => {
                    const isActive = filters.tags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={isActive ? 'active' : undefined}
                      >
                        #{tag}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-[var(--text-muted)]">Add uploads to see trending tags.</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
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
                Go to admin
              </Link>
            </div>
          </section>

          <section className="gallery-preview space-y-6">
            <div className="gallery-header">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-muted)]">Instant results</p>
                <h2 className="text-3xl text-[var(--color-text)]">Gallery preview</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing {filteredImages.length} of {sortedImages.length} captures.
                </p>
              </div>
              <Link href="/gallery" className="pixel-btn pixel-btn-cyan text-[0.65rem]">
                Open archive
              </Link>
            </div>
            <AutoFilterBar
              stores={quickFilters.topStores}
              tags={quickFilters.topTags}
              onStoreSelect={(store) => setFilters((prev) => ({ ...prev, stores: [store] }))}
              onTagSelect={(tag) => setFilters((prev) => ({ ...prev, tags: [tag] }))}
              onReset={resetFilters}
            />
            <div className="gallery-shell">
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
      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>Built and curated by Dmytro Usoltsev • Project Proofy</p>
          <p className="text-sm">
            Seamless uploads, metadata intelligence, and gallery storytelling. Need help? Reach out via the admin desk.
          </p>
          <div className="filters-dock">
            <Link href="/gallery">Gallery</Link>
            <Link href="/admin/upload">Upload</Link>
            <Link href="/admin/manage">Manage</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
