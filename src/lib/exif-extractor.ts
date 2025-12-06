// eslint-disable-next-line @typescript-eslint/no-var-requires
const ExifParser = require('exif-parser');

export interface ExifData {
    dateTaken?: string; // ISO date string
    gps?: {
        latitude: number;
        longitude: number;
    };
    camera?: {
        make?: string;
        model?: string;
    };
    dimensions?: {
        width: number;
        height: number;
    };
}

/**
 * Extract EXIF metadata from an image buffer
 */
export async function extractExifData(buffer: Buffer): Promise<ExifData> {
    try {
        const parser = ExifParser.create(buffer);
        const result = parser.parse();

        const exifData: ExifData = {};

        // Extract date taken
        if (result.tags?.DateTimeOriginal) {
            // DateTimeOriginal is in seconds since epoch
            const date = new Date(result.tags.DateTimeOriginal * 1000);
            exifData.dateTaken = date.toISOString();
        } else if (result.tags?.DateTime) {
            const date = new Date(result.tags.DateTime * 1000);
            exifData.dateTaken = date.toISOString();
        }

        // Extract GPS coordinates
        if (result.tags?.GPSLatitude && result.tags?.GPSLongitude) {
            exifData.gps = {
                latitude: result.tags.GPSLatitude,
                longitude: result.tags.GPSLongitude,
            };
        }

        // Extract camera info
        if (result.tags?.Make || result.tags?.Model) {
            exifData.camera = {
                make: result.tags.Make,
                model: result.tags.Model,
            };
        }

        // Extract dimensions
        if (result.imageSize) {
            exifData.dimensions = {
                width: result.imageSize.width,
                height: result.imageSize.height,
            };
        }

        console.log('[EXIF] Extracted metadata:', {
            hasDate: !!exifData.dateTaken,
            hasGPS: !!exifData.gps,
            hasCamera: !!exifData.camera,
            hasDimensions: !!exifData.dimensions,
        });

        return exifData;
    } catch (error) {
        console.error('[EXIF] Failed to extract metadata:', error);
        return {};
    }
}

/**
 * Extract EXIF data from a File object (client-side)
 */
export async function extractExifFromFile(file: File): Promise<ExifData> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const buffer = Buffer.from(arrayBuffer);
                const exifData = await extractExifData(buffer);
                resolve(exifData);
            } catch (error) {
                console.error('[EXIF] Failed to read file:', error);
                resolve({});
            }
        };

        reader.onerror = () => {
            console.error('[EXIF] FileReader error');
            resolve({});
        };

        // Only read first 64KB for EXIF data (it's at the beginning)
        reader.readAsArrayBuffer(file.slice(0, 65536));
    });
}

/**
 * Format GPS coordinates for display
 */
export function formatGPSCoordinates(gps: { latitude: number; longitude: number }): string {
    const latDir = gps.latitude >= 0 ? 'N' : 'S';
    const lonDir = gps.longitude >= 0 ? 'E' : 'W';

    return `${Math.abs(gps.latitude).toFixed(6)}°${latDir}, ${Math.abs(gps.longitude).toFixed(6)}°${lonDir}`;
}

/**
 * Get Google Maps URL for coordinates
 */
export function getGoogleMapsUrl(gps: { latitude: number; longitude: number }): string {
    return `https://www.google.com/maps?q=${gps.latitude},${gps.longitude}`;
}
