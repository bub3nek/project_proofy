'use client';

import { useCallback, useEffect, useState } from 'react';

import { ImageMetadata } from '@/types';

export function useImageLibrary() {
    const [images, setImages] = useState<ImageMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchImages = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/images', { cache: 'no-store' });
            const data = (await response.json()) as ImageMetadata[];
            setImages(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load images');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const addImages = useCallback((created: ImageMetadata[]) => {
        setImages((prev) => [...created, ...prev]);
    }, []);

    const updateImage = useCallback((updated: ImageMetadata) => {
        setImages((prev) => prev.map((img) => (img.id === updated.id ? updated : img)));
    }, []);

    const removeImage = useCallback((id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    }, []);

    return {
        images,
        isLoading,
        error,
        refresh: fetchImages,
        addImages,
        updateImage,
        removeImage,
    };
}
