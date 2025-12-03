'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { UploadManager } from '@/components/Admin/UploadManager';
import { ProtectedRoute } from '@/components/Admin/ProtectedRoute';
import { useImageLibrary } from '@/hooks/useImageLibrary';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { formatDate } from '@/lib/utils';

export default function AdminUploadPage() {
    const { images, addImages } = useImageLibrary();
    const recent = images.slice(0, 3);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] px-4 md:px-8 py-8 space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link href="/admin" className="pixel-btn pixel-btn-cyan inline-flex items-center gap-2 text-xs mb-4">
                            <ArrowLeft size={14} />
                            BACK TO DASHBOARD
                        </Link>
                        <p className="text-[var(--text-muted)] font-['VT323'] text-xl">PHASE 5 • UPLOAD</p>
                        <h1 className="text-glow-cyan text-3xl">BULK UPLOAD INTERFACE</h1>
                    </div>
                </div>

                <UploadManager onImagesCreated={addImages} />

                <section className="pixel-card glow-magenta p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[var(--text-muted)] font-['VT323'] text-xl">VERIFICATION</p>
                            <h2 className="text-glow-magenta">RECENT ENTRIES</h2>
                        </div>
                        <Link href="/admin/manage" className="pixel-btn pixel-btn-magenta text-xs">
                            MANAGE LIBRARY
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <p className="text-[var(--text-secondary)] font-['VT323'] text-lg">Nothing uploaded yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {recent.map((image) => (
                                <div key={image.id} className="space-y-2">
                                    <div className="relative w-full h-40 border border-[var(--border-color)] overflow-hidden">
                                        <ResponsiveImage metadata={image} fill className="object-cover" sizes="33vw" />
                                    </div>
                                    <p className="font-['Press_Start_2P'] text-xs truncate">{image.store}</p>
                                    <p className="font-['VT323'] text-sm text-[var(--text-muted)]">{formatDate(image.date)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </ProtectedRoute>
    );
}
