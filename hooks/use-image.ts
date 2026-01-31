import { useState, useEffect } from 'react';
import { getImage, ImageFolder } from '@/lib/db/images';

interface UseImageProps {
    uuid: string;
    updatedAt: string;
    imageSizeBytes: number | null;
    folder: ImageFolder;
}

export function useImage({ uuid, updatedAt, imageSizeBytes, folder }: UseImageProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!imageSizeBytes) {
            setImageUrl(null);
            return;
        }

        let isMounted = true;

        const fetchImage = async () => {
            try {
                setLoading(true);
                const url = await getImage(uuid, folder, updatedAt);
                if (isMounted && url) {
                    setImageUrl(url);
                }
            } catch (error) {
                console.error('Error fetching image:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
        };
    }, [uuid, updatedAt, imageSizeBytes, folder]);

    return { imageUrl, loading };
}
