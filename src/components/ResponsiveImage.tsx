import Image from 'next/image';

import { ImageMetadata } from '@/types';

const palette = [
    '#00ffff',
    '#ff00ff',
    '#b026ff',
    '#ff6600',
    '#39ff14',
    '#0080ff',
];

function fallbackPlaceholder(seed: string) {
    const color = palette[Math.abs(seed.charCodeAt(0)) % palette.length];
    const encoded = encodeURIComponent(color);
    return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='${encoded}'/></svg>`;
}

interface ResponsiveImageProps {
    metadata: ImageMetadata;
    alt?: string;
    className?: string;
    sizes?: string;
    priority?: boolean;
    fill?: boolean;
    quality?: number;
}

export function ResponsiveImage({
    metadata,
    alt,
    className,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw',
    priority = false,
    fill = false,
    quality = 85,
}: ResponsiveImageProps) {
    const placeholder = metadata.placeholder || fallbackPlaceholder(metadata.id);
    const resolvedAlt = alt || metadata.notes || 'Gallery image';
    const loadingMode: 'eager' | 'lazy' = priority ? 'eager' : 'lazy';

    if (fill) {
        return (
            <Image
                src={metadata.url}
                alt={resolvedAlt}
                className={className}
                sizes={sizes}
                placeholder="blur"
                blurDataURL={placeholder}
                loading={loadingMode}
                quality={quality}
                fill
            />
        );
    }

    return (
        <Image
            src={metadata.url}
            alt={resolvedAlt}
            className={className}
            sizes={sizes}
            placeholder="blur"
            blurDataURL={placeholder}
            loading={loadingMode}
            quality={quality}
            width={metadata.width || 1200}
            height={metadata.height || 800}
        />
    );
}
