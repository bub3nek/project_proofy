'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { upload } from '@vercel/blob/client';
import { motion } from 'framer-motion';
import { Upload, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { ImageMetadata, ApiResponse } from '@/types';
import { getWeekNumber } from '@/lib/utils';
import { UploadZone } from './UploadZone';
import { MetadataForm } from './MetadataForm';
import { previewSmartTags } from '@/lib/image-intelligence';
import { extractExifFromFile } from '@/lib/exif-extractor';

interface UploadManagerProps {
    onImagesCreated?: (images: ImageMetadata[]) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface PendingUpload {
    id: string;
    file: File;
    preview: string;
    store: string;
    date: string;
    tags: string;
    notes: string;
    width?: number;
    height?: number;
    placeholder?: string;
    bytes: number;
    mimeType: string;
    status: UploadStatus;
    error?: string;
    optimizationStats?: {
        originalSize: number;
        finalSize: number;
        reduction: string;
        processingTime: number;
    };
    gps?: {
        latitude: number;
        longitude: number;
    };
    camera?: {
        make?: string;
        model?: string;
    };
}

async function extractImageDetails(file: File) {
    const url = URL.createObjectURL(file);
    const image = document.createElement('img');
    image.src = url;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (event) => {
            URL.revokeObjectURL(url);
            reject(event);
        };
    });

    const width = image.naturalWidth;
    const height = image.naturalHeight;

    const canvas = document.createElement('canvas');
    const maxWidth = 32;
    const ratio = width === 0 ? 1 : maxWidth / width;
    canvas.width = maxWidth;
    canvas.height = Math.max(1, Math.round(height * ratio));
    const context = canvas.getContext('2d');
    if (context) {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    const placeholder = canvas.toDataURL('image/jpeg', 0.5);

    return { width, height, placeholder, preview: url };
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function parseTags(value: string) {
    return value
        .split(',')
        .map((tag) => tag.trim().toUpperCase())
        .filter(Boolean);
}

export function UploadManager({ onImagesCreated }: UploadManagerProps) {
    const [queue, setQueue] = useState<PendingUpload[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const mapped = await Promise.all(
            acceptedFiles.map(async (file) => {
                const details = await extractImageDetails(file);
                const exifData = await extractExifFromFile(file);

                // Auto-fill date from EXIF if available
                const autoDate = exifData.dateTaken
                    ? exifData.dateTaken.split('T')[0] // Convert ISO to YYYY-MM-DD
                    : '';

                console.log('[Upload] EXIF data extracted:', {
                    file: file.name,
                    hasDate: !!exifData.dateTaken,
                    hasGPS: !!exifData.gps,
                    hasCamera: !!exifData.camera,
                });

                return {
                    id: crypto.randomUUID(),
                    file,
                    preview: details.preview,
                    store: '',
                    date: autoDate,
                    tags: '',
                    notes: exifData.camera ? `${exifData.camera.make || ''} ${exifData.camera.model || ''}`.trim() : '',
                    width: exifData.dimensions?.width || details.width,
                    height: exifData.dimensions?.height || details.height,
                    placeholder: details.placeholder,
                    bytes: file.size,
                    mimeType: file.type,
                    status: 'idle' as UploadStatus,
                    gps: exifData.gps,
                    camera: exifData.camera,
                };
            })
        );

        setQueue((prev) => [...prev, ...mapped]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'image/*': [],
        },
    });

    const readyItems = queue.filter((item) => item.store && item.date);
    const incompleteItems = queue.length - readyItems.length;

    const canUpload = queue.length > 0 && readyItems.length > 0 && !isUploading;

    const statusLabel = useMemo(() => {
        if (isUploading) return 'UPLOADING...';
        if (!queue.length) return 'DROP FILES TO BEGIN';
        if (!readyItems.length) return 'ADD REQUIRED METADATA';
        if (incompleteItems) return `READY (${readyItems.length}) • ${incompleteItems} NEED INFO`;
        return `READY (${readyItems.length})`;
    }, [isUploading, queue.length, readyItems.length, incompleteItems]);

    const updateItem = (id: string, updates: Partial<PendingUpload>) => {
        setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    };

    const updateMetadataFields = (
        id: string,
        updates: Partial<Record<'store' | 'date' | 'tags' | 'notes', string>>
    ) => {
        updateItem(id, updates);
    };

    const removeItem = (id: string) => {
        setQueue((prev) => {
            const target = prev.find((item) => item.id === id);
            if (target) {
                URL.revokeObjectURL(target.preview);
            }
            return prev.filter((item) => item.id !== id);
        });
    };

    async function uploadSingle(item: PendingUpload) {
        updateItem(item.id, { status: 'uploading', error: undefined });

        try {
            console.log('[Upload] Starting upload for:', item.file.name);
            const blob = await upload(item.file.name, item.file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            });
            console.log('[Upload] Blob uploaded successfully:', { url: blob.url, pathname: blob.pathname });

            console.log('[Upload] Starting optimization...');
            const optimizeResponse = await fetch('/api/upload/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: blob.url,
                    pathname: blob.pathname,
                    mimeType: item.mimeType,
                }),
            });

            const optimizeJson = (await optimizeResponse.json()) as ApiResponse<{
                url: string;
                pathname: string;
                width?: number;
                height?: number;
                bytes?: number;
                mimeType?: string;
                optimizationStats?: {
                    originalSize: number;
                    finalSize: number;
                    reduction: string;
                    processingTime: number;
                };
            }>;

            if (!optimizeResponse.ok || !optimizeJson.success || !optimizeJson.data) {
                const errorMsg = optimizeJson.error || 'Optimization failed';
                console.error('[Upload] Optimization failed:', errorMsg);
                throw new Error(errorMsg);
            }

            // Log optimization stats
            if (optimizeJson.data.optimizationStats) {
                console.log('[Upload] Optimization stats:', optimizeJson.data.optimizationStats);
                updateItem(item.id, { optimizationStats: optimizeJson.data.optimizationStats });
            }
            console.log('[Upload] Optimization complete');

            console.log('[Upload] Saving metadata...');
            const metadataResponse = await fetch('/api/images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: optimizeJson.data.url,
                    blobPath: optimizeJson.data.pathname,
                    store: item.store,
                    date: item.date,
                    tags: parseTags(item.tags),
                    notes: item.notes,
                    width: optimizeJson.data.width ?? item.width,
                    height: optimizeJson.data.height ?? item.height,
                    placeholder: item.placeholder,
                    bytes: optimizeJson.data.bytes ?? item.bytes,
                    mimeType: optimizeJson.data.mimeType ?? item.mimeType,
                    gps: item.gps,
                    camera: item.camera,
                }),
            });

            const metadataJson = (await metadataResponse.json()) as ApiResponse<ImageMetadata>;
            if (!metadataJson.success || !metadataJson.data) {
                const errorMsg = metadataJson.error || 'Failed to save metadata';
                console.error('[Upload] Metadata save failed:', errorMsg);
                throw new Error(errorMsg);
            }

            console.log('[Upload] Upload complete for:', item.file.name);
            updateItem(item.id, { status: 'success' });
            URL.revokeObjectURL(item.preview);
            return metadataJson.data;
        } catch (error) {
            console.error('[Upload] Upload failed for:', item.file.name, error);
            throw error;
        }
    }

    const handleUploadAll = async () => {
        setIsUploading(true);
        setGlobalError(null);
        const created: ImageMetadata[] = [];
        let lastError: string | null = null;

        for (const item of readyItems) {
            try {
                const image = await uploadSingle(item);
                created.push(image);
                setQueue((prev) => prev.filter((entry) => entry.id !== item.id));
            } catch (error) {
                console.error(error);
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                lastError = errorMessage;
                updateItem(item.id, {
                    status: 'error',
                    error: errorMessage,
                });
            }
        }

        setIsUploading(false);

        if (created.length && onImagesCreated) {
            onImagesCreated(created);
        }

        if (!created.length && readyItems.length > 0) {
            setGlobalError(
                lastError
                    ? `Upload failed: ${lastError}`
                    : 'Uploads failed. Please review the items flagged in red.'
            );
        }
    };

    return (
        <section className="pixel-card glow-cyan p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p className="text-[var(--text-muted)] font-['VT323'] text-xl">PHASE 5 • IMAGE MANAGEMENT</p>
                    <h2 className="text-glow-cyan">UPLOAD QUEUE</h2>
                </div>
                <Button
                    type="button"
                    variant="cyan"
                    className="flex items-center gap-2"
                    disabled={!canUpload}
                    onClick={handleUploadAll}
                >
                    <Upload size={16} />
                    {statusLabel}
                </Button>
            </div>

            <UploadZone getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} />

            {globalError && (
                <div className="p-3 border border-[var(--neon-pink)] text-[var(--neon-pink)] font-['VT323']">
                    {globalError}
                </div>
            )}

            {queue.length > 0 && (
                <div className="space-y-4">
                    {queue.map((item) => {
                        const week = item.date ? getWeekNumber(item.date) : null;
                        const suggested = previewSmartTags({
                            store: item.store,
                            date: item.date,
                            notes: item.notes,
                            tags: parseTags(item.tags),
                        }).slice(0, 4);
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`pixel-card border ${item.status === 'error' ? 'border-[var(--neon-pink)]' : 'border-[var(--border-color)]'} p-4`}
                            >
                                <div className="grid gap-4 md:grid-cols-[160px_1fr_120px]">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="relative w-36 h-36 border border-[var(--border-color)] overflow-hidden">
                                            <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="text-center font-['VT323'] text-sm text-[var(--text-muted)]">
                                            {item.file.name}
                                            <br />
                                            {formatBytes(item.bytes)}
                                        </div>
                                        {item.status === 'error' && (
                                            <p className="text-[var(--neon-pink)] text-sm text-center">{item.error}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <MetadataForm
                                            store={item.store}
                                            date={item.date}
                                            tags={item.tags}
                                            notes={item.notes}
                                            week={week}
                                            onChange={(updates) => updateMetadataFields(item.id, updates)}
                                        />
                                        {suggested.length > 0 && (
                                            <div className="text-xs text-[var(--text-muted)] space-y-2">
                                                <p className="font-['Press_Start_2P'] text-[10px] tracking-widest">AUTO TAGS</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggested.map((tag) => (
                                                        <span key={tag} className="pixel-btn pixel-btn-cyan text-[10px]">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="px-3 py-2 border border-[var(--border-color)] font-['VT323'] text-sm">
                                            <p>DIMENSIONS</p>
                                            <p>
                                                {item.width} × {item.height}
                                            </p>
                                        </div>
                                        <div className="px-3 py-2 border border-[var(--border-color)] font-['VT323'] text-sm">
                                            <p>STATUS</p>
                                            <p>
                                                {item.status.toUpperCase()}
                                            </p>
                                        </div>
                                        {item.optimizationStats && (
                                            <div className="px-3 py-2 border border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/5 font-['VT323'] text-sm">
                                                <p className="text-[var(--neon-cyan)]">OPTIMIZED</p>
                                                <p className="text-xs">
                                                    {item.optimizationStats.reduction} smaller
                                                </p>
                                                <p className="text-xs text-[var(--text-muted)]">
                                                    {(item.optimizationStats.finalSize / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        )}
                                        <Button
                                            type="button"
                                            variant="magenta"
                                            className="flex items-center gap-2 justify-center"
                                            onClick={() => removeItem(item.id)}
                                            disabled={isUploading}
                                        >
                                            <Trash2 size={16} />
                                            REMOVE
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
