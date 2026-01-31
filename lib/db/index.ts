const DB_NAME = "billforge-db";
const DB_VERSION = 1;

export const STORES = {
    CACHED_IMAGES: "cached_images",
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            reject(new Error("IndexedDB is not available server-side"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORES.CACHED_IMAGES)) {
                db.createObjectStore(STORES.CACHED_IMAGES, { keyPath: ["uuid", "folder"] });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });

    return dbPromise;
}
