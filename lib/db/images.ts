import { getDB, STORES } from "./index";
import { getImageUrl } from "@/lib/images/operations";

export interface CachedImage {
    uuid: string;
    updatedAt: string;
    blob: Blob;
}

export enum ImageFolder {
    USER = 'users',
    BUSINESSES = 'businesses',
    ITEMS = 'items',
}

export async function saveImageToCache(uuid: string, folder: ImageFolder, updatedAt: string, blob: Blob): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CACHED_IMAGES, "readwrite");
        const store = transaction.objectStore(STORES.CACHED_IMAGES);
        const request = store.put({ uuid, folder, updatedAt, blob });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function deleteImageFromCache(uuid: string, folder: ImageFolder): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CACHED_IMAGES, "readwrite");
        const store = transaction.objectStore(STORES.CACHED_IMAGES);
        const request = store.delete([uuid, folder]);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getImageFromCache(uuid: string, folder: ImageFolder): Promise<CachedImage | undefined> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.CACHED_IMAGES, "readonly");
        const store = transaction.objectStore(STORES.CACHED_IMAGES);
        const request = store.get([uuid, folder]);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function getImage(uuid: string, folder: ImageFolder, updatedAt: string): Promise<string | null> {
    try {
        const cached = await getImageFromCache(uuid, folder);
        if (cached) {
            const cachedDate = new Date(cached.updatedAt).getTime();
            const serverDate = new Date(updatedAt).getTime();

            if (cachedDate >= serverDate) {
                return URL.createObjectURL(cached.blob);
            }
        }

        const result = await getImageUrl({
            folder,
            uuid,
            updatedAt,
        });

        if (result.success && result.url) {
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(result.url)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                console.error(`Failed to fetch image via proxy: ${response.statusText}`);
                return null;
            }

            const blob = await response.blob();

            await saveImageToCache(uuid, folder, updatedAt, blob);

            return URL.createObjectURL(blob);
        }
    } catch (error) {
        console.error("Failed to get image:", error);
    }

    return null;
}
