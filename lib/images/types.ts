export interface UploadImageOptions {
    file: File;
    folder: 'users' | 'businesses' | 'items';
    uuid: string;
}

export interface UploadImageResult {
    success: boolean;
    url?: string;
    key?: string;
    sizeBytes?: number;
    error?: string;
}

export interface DeleteImageOptions {
    folder: 'users' | 'businesses' | 'items';
    uuid: string;
}

export interface DeleteImageResult {
    success: boolean;
    error?: string;
}

export interface GetImageUrlOptions {
    folder: 'users' | 'businesses' | 'items';
    uuid: string;
    updatedAt?: string;
}

export interface GetImageUrlResult {
    success: boolean;
    url?: string;
    error?: string;
}

export type ImageFolder = 'users' | 'businesses' | 'items';

