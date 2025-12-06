'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Loader2, Search } from 'lucide-react';

import { ImageMetadata, ApiResponse } from '@/types';
import { formatDate } from '@/lib/utils';
import { ResponsiveImage } from '@/components/ResponsiveImage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ImageManagerProps {
    images: ImageMetadata[];
    isLoading: boolean;
    onImageUpdated: (image: ImageMetadata) => void;
    onImageDeleted: (id: string) => void;
}

function parseTags(value: string) {
    return value
        .split(',')
        .map((tag) => tag.trim().toUpperCase())
        .filter(Boolean);
}

function formatBytes(bytes?: number) {
    if (!bytes || bytes <= 0) return '—';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function ImageManager({ images, isLoading, onImageDeleted, onImageUpdated }: ImageManagerProps) {
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<ImageMetadata | null>(null);
    const [formState, setFormState] = useState({ store: '', date: '', tags: '', notes: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [tableError, setTableError] = useState<string | null>(null);

    const filteredImages = useMemo(() => {
        if (!search) return images;
        const query = search.toLowerCase();
        return images.filter((img) => {
            return (
                img.store.toLowerCase().includes(query) ||
                img.notes.toLowerCase().includes(query) ||
                img.tags.some((tag) => tag.toLowerCase().includes(query))
            );
        });
    }, [images, search]);

    const openEditor = (image: ImageMetadata) => {
        setEditing(image);
        setFormState({
            store: image.store,
            date: image.date.split('T')[0], // Convert ISO to YYYY-MM-DD
            tags: image.tags.join(', '),
            notes: image.notes,
        });
        setTableError(null);
    };

    const closeEditor = () => {
        setEditing(null);
        setIsSaving(false);
    };

    const handleSave = async () => {
        if (!editing) return;
        setIsSaving(true);
        setTableError(null);

        try {
            const response = await fetch(`/api/images/${editing.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    store: formState.store,
                    date: formState.date,
                    tags: parseTags(formState.tags),
                    notes: formState.notes,
                }),
            });

            const json = (await response.json()) as ApiResponse<ImageMetadata>;

            if (!json.success || !json.data) {
                throw new Error(json.error || 'Failed to update image');
            }

            onImageUpdated(json.data);
            closeEditor();
        } catch (error) {
            setTableError(error instanceof Error ? error.message : 'Failed to update image');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (image: ImageMetadata) => {
        const confirmation = confirm(`Delete image ${image.id}?`);
        if (!confirmation) return;
        setTableError(null);

        try {
            const response = await fetch(`/api/images/${image.id}`, {
                method: 'DELETE',
            });
            const json = (await response.json()) as ApiResponse<ImageMetadata>;
            if (!json.success) {
                throw new Error(json.error || 'Failed to delete image');
            }
            onImageDeleted(image.id);
        } catch (error) {
            setTableError(error instanceof Error ? error.message : 'Failed to delete image');
        }
    };

    return (
        <section className="pixel-card glow-purple p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <p className="text-[var(--text-muted)] font-['VT323'] text-xl">PHASE 5 • LIBRARY</p>
                    <h2 className="text-glow-purple">IMAGE INVENTORY</h2>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-[var(--neon-purple)]" />
                    </div>
                    <Input
                        placeholder="Search by store, tag, or note..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9 h-11"
                    />
                </div>
            </div>

            {tableError && (
                <div className="p-3 border border-[var(--neon-pink)] text-[var(--neon-pink)] font-['VT323'] text-sm">
                    {tableError}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[var(--text-muted)] font-['VT323'] text-sm">
                            <th className="py-3 border-b border-[var(--border-color)]">Preview</th>
                            <th className="py-3 border-b border-[var(--border-color)]">Store</th>
                            <th className="py-3 border-b border-[var(--border-color)]">Date / Week</th>
                            <th className="py-3 border-b border-[var(--border-color)]">File Size</th>
                            <th className="py-3 border-b border-[var(--border-color)]">Tags</th>
                            <th className="py-3 border-b border-[var(--border-color)]">Notes</th>
                            <th className="py-3 border-b border-[var(--border-color)]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="py-6 text-center text-[var(--text-muted)]">
                                    Loading inventory...
                                </td>
                            </tr>
                        )}

                        {!isLoading && filteredImages.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-6 text-center text-[var(--text-muted)]">
                                    No images match the current filters.
                                </td>
                            </tr>
                        )}

                        {filteredImages.map((image) => (
                            <motion.tr
                                key={image.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border-b border-[var(--border-color)]"
                            >
                                <td className="py-4">
                                    <div className="relative w-24 h-24 overflow-hidden rounded border border-[var(--border-color)]">
                                        <ResponsiveImage metadata={image} fill className="object-cover" sizes="96px" />
                                    </div>
                                </td>
                                <td className="py-4 font-['VT323'] text-lg">{image.store}</td>
                                <td className="py-4 font-['VT323'] text-base">
                                    {formatDate(image.date)}
                                    <br />
                                    <span className="text-[var(--text-muted)]">Week {image.week}</span>
                                </td>
                                <td className="py-4 text-sm font-['VT323'] text-base">{formatBytes(image.bytes)}</td>
                                <td className="py-4 text-sm font-['VT323']">{image.tags.join(', ') || '—'}</td>
                                <td className="py-4 text-sm text-[var(--text-secondary)] max-w-sm">{image.notes || '—'}</td>
                                <td className="py-4">
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="cyan"
                                            className="flex items-center gap-2 px-3 py-2 text-xs"
                                            onClick={() => openEditor(image)}
                                        >
                                            <Pencil size={14} />
                                            EDIT
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="magenta"
                                            className="flex items-center gap-2 px-3 py-2 text-xs"
                                            onClick={() => handleDelete(image)}
                                        >
                                            <Trash2 size={14} />
                                            DELETE
                                        </Button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={!!editing} onClose={closeEditor} title="Edit Image Metadata">
                {editing && (
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-1">Store</label>
                                <Input
                                    value={formState.store}
                                    onChange={(event) => setFormState((prev) => ({ ...prev, store: event.target.value.toUpperCase() }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-1">Date</label>
                                <Input
                                    type="date"
                                    value={formState.date}
                                    onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Tags</label>
                            <Input
                                value={formState.tags}
                                onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
                                placeholder="WINTER, DISPLAY, WINDOW"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-[var(--text-muted)] mb-1">Notes</label>
                            <textarea
                                className="pixel-input w-full h-32"
                                value={formState.notes}
                                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="purple" onClick={closeEditor}>
                                CANCEL
                            </Button>
                            <Button type="button" variant="cyan" disabled={isSaving} onClick={handleSave} className="flex items-center gap-2">
                                {isSaving && <Loader2 size={16} className="animate-spin" />}
                                SAVE CHANGES
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </section>
    );
}
