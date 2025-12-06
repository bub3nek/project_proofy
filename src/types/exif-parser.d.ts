declare module 'exif-parser' {
    interface ExifResult {
        tags?: {
            DateTimeOriginal?: number;
            DateTime?: number;
            GPSLatitude?: number;
            GPSLongitude?: number;
            Make?: string;
            Model?: string;
            [key: string]: any;
        };
        imageSize?: {
            width: number;
            height: number;
        };
    }

    interface ExifParser {
        parse(): ExifResult;
    }

    function create(buffer: Buffer): ExifParser;

    export = {
        create
    };
}
