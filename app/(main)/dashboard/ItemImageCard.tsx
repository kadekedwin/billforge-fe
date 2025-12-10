"use client";

import { useState, useEffect, memo } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/images/operations";
import type { Item } from "@/lib/api";

interface ItemImageCardProps {
    item: Item;
}

const imageUrlCache = new Map<string, string>();

export const ItemImageCard = memo(({ item }: ItemImageCardProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cacheKey = `${item.uuid}-${item.updated_at}`;

        if (imageUrlCache.has(cacheKey)) {
            setImageUrl(imageUrlCache.get(cacheKey)!);
            return;
        }

        const loadImage = async () => {
            if (item.image_size_bytes) {
                setLoading(true);
                const result = await getImageUrl({
                    folder: 'items',
                    uuid: item.uuid,
                });
                if (result.success && result.url) {
                    imageUrlCache.set(cacheKey, result.url);
                    setImageUrl(result.url);
                }
                setLoading(false);
            }
        };
        loadImage();
    }, [item.uuid, item.updated_at]);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (imageUrl) {
        return (
            <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-center p-4">
                <div className="text-4xl font-bold text-muted-foreground">
                    {item.name.substring(0, 2).toUpperCase()}
                </div>
            </div>
        </div>
    );
});

ItemImageCard.displayName = 'ItemImageCard';