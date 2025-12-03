'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { ProtectedRoute } from '@/components/Admin/ProtectedRoute';
import { useImageLibrary } from '@/hooks/useImageLibrary';
import { ImageManager } from '@/components/Admin/ImageManager';

export default function AdminManagePage() {
    const { images, isLoading, error, updateImage, removeImage, refresh } = useImageLibrary();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] px-4 md:px-8 py-8 space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link href="/admin" className="pixel-btn pixel-btn-cyan inline-flex items-center gap-2 text-xs mb-4">
                            <ArrowLeft size={14} />
                            BACK TO DASHBOARD
                        </Link>
                        <p className="text-[var(--text-muted)] font-['VT323'] text-xl">PHASE 5 • LIBRARY</p>
                        <h1 className="text-glow-purple text-3xl">ARCHIVE MANAGEMENT</h1>
                    </div>
                    <button
                        onClick={refresh}
                        className="pixel-btn pixel-btn-purple self-start text-xs"
                        disabled={isLoading}
                    >
                        REFRESH DATA
                    </button>
                </div>

                {error && (
                    <div className="pixel-card glow-magenta p-4 text-[var(--neon-pink)] font-['VT323'] text-lg">
                        {error}
                    </div>
                )}

                <ImageManager
                    images={images}
                    isLoading={isLoading}
                    onImageUpdated={updateImage}
                    onImageDeleted={removeImage}
                />
            </div>
        </ProtectedRoute>
    );
}
