export interface ImageMetadata {
    id: string;
    url: string;
    blobPath?: string;
    width?: number;
    height?: number;
    bytes?: number;
    mimeType?: string;
    placeholder?: string;
    store: string;
    date: string;
    week: number;
    tags: string[];
    notes: string;
    uploadedAt: string;
    sortKey?: number;
}

export interface FilterOptions {
    stores?: string[];
    dateRange?: {
        start: string;
        end: string;
    };
    weeks?: number[];
    tags?: string[];
    searchQuery?: string;
}

export interface UploadResponse {
    success: boolean;
    data?: ImageMetadata;
    error?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface NewImagePayload {
    url: string;
    blobPath?: string;
    width?: number;
    height?: number;
    bytes?: number;
    mimeType?: string;
    placeholder?: string;
    store: string;
    date: string;
    tags?: string[];
    notes?: string;
}

export type UpdateImagePayload = Partial<Omit<ImageMetadata, 'id' | 'uploadedAt' | 'week'>> & {
    date?: string;
};
