"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, ListChecks, Globe } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useImageLibrary } from '@/hooks/useImageLibrary';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { formatDate } from '@/lib/utils';

export function AdminDashboard() {
    const { images, isLoading, error, refresh } = useImageLibrary();

    const stats = {
        total: images.length,
        stores: new Set(images.map((img) => img.store)).size,
        tags: new Set(images.flatMap((img) => img.tags)).size,
    };

    const recent = images.slice(0, 4);

    return (
        <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
                <header className="sticky top-0 z-40 border-b-2 border-[var(--border-color)] bg-[var(--bg-dark)]/95 backdrop-blur">
                    <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-[var(--text-muted)] font-['VT323'] text-xl">CONTROL PANEL</p>
                            <h1 className="text-2xl md:text-3xl text-glow-cyan">ADMIN DASHBOARD</h1>
                        </div>

                        <div className="flex gap-3">
                            <Link href="/" className="pixel-btn pixel-btn-cyan flex items-center gap-2 text-xs">
                                <Globe size={14} />
                                PUBLIC MODE
                            </Link>
                            <Button
                                type="button"
                                variant="purple"
                                className="flex items-center gap-2"
                                onClick={refresh}
                                disabled={isLoading}
                            >
                                REFRESH
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 space-y-10">
                    {error && (
                        <div className="pixel-card glow-magenta p-4 text-[var(--neon-pink)] font-['VT323'] text-lg">
                            {error}
                        </div>
                    )}

                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <div className="pixel-card glow-cyan p-6">
                            <p className="text-[var(--text-muted)] font-['VT323'] text-xl">TOTAL IMAGES</p>
                            <p className="text-4xl font-['Press_Start_2P'] mt-2">{stats.total}</p>
                        </div>
                        <div className="pixel-card glow-magenta p-6">
                            <p className="text-[var(--text-muted)] font-['VT323'] text-xl">STORES</p>
                            <p className="text-4xl font-['Press_Start_2P'] mt-2">{stats.stores}</p>
                        </div>
                        <div className="pixel-card glow-purple p-6">
                            <p className="text-[var(--text-muted)] font-['VT323'] text-xl">TAGS</p>
                            <p className="text-4xl font-['Press_Start_2P'] mt-2">{stats.tags}</p>
                        </div>
                    </motion.section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/admin/upload" className="pixel-card glow-cyan p-6 flex flex-col gap-4 group">
                            <div className="flex items-center justify-between">
                                <p className="text-[var(--text-muted)] font-['VT323'] text-xl">PHASE 5 • UPLOADS</p>
                                <Upload className="text-[var(--neon-cyan)]" size={28} />
                            </div>
                            <h2 className="text-glow-cyan text-2xl">BULK UPLOAD</h2>
                            <p className="text-[var(--text-secondary)]">
                                Drag & drop files, attach metadata, and push them straight into the archive.
                            </p>
                            <Button variant="cyan" className="self-start flex items-center gap-2">
                                GO TO UPLOADS
                                <ArrowRight size={16} />
                            </Button>
                        </Link>

                        <Link href="/admin/manage" className="pixel-card glow-purple p-6 flex flex-col gap-4 group">
                            <div className="flex items-center justify-between">
                                <p className="text-[var(--text-muted)] font-['VT323'] text-xl">PHASE 5 • LIBRARY</p>
                                <ListChecks className="text-[var(--neon-purple)]" size={28} />
                            </div>
                            <h2 className="text-glow-purple text-2xl">MANAGE ARCHIVE</h2>
                            <p className="text-[var(--text-secondary)]">
                                Edit metadata, delete stale assets, and run quality checks on every upload.
                            </p>
                            <Button variant="purple" className="self-start flex items-center gap-2">
                                VIEW INVENTORY
                                <ArrowRight size={16} />
                            </Button>
                        </Link>
                    </section>

                    <section className="pixel-card glow-magenta p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[var(--text-muted)] font-['VT323'] text-xl">LATEST</p>
                                <h2 className="text-glow-magenta">RECENT UPLOADS</h2>
                            </div>
                            <Link href="/gallery" className="pixel-btn pixel-btn-magenta flex items-center gap-2 text-xs">
                                OPEN GALLERY
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        {recent.length === 0 && (
                            <p className="text-[var(--text-secondary)] font-['VT323'] text-lg">No uploads yet.</p>
                        )}

                        <div className="grid gap-4 md:grid-cols-4">
                            {recent.map((image) => (
                                <div key={image.id} className="space-y-2">
                                    <div className="relative w-full h-36 border border-[var(--border-color)] overflow-hidden">
                                        <ResponsiveImage metadata={image} fill className="object-cover" sizes="25vw" />
                                    </div>
                                    <p className="font-['Press_Start_2P'] text-xs truncate">{image.store}</p>
                                    <p className="font-['VT323'] text-sm text-[var(--text-muted)]">{formatDate(image.date)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
    );
}
