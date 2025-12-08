"use client";

import { useState, useEffect, memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/images/operations";
import type { Item } from "@/lib/api";

interface ItemImageProps {
    item: Item;
}

export const ItemImage = memo(({ item }: ItemImageProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            if (item.image_size_bytes) {
                setLoading(true);
                const result = await getImageUrl({
                    folder: 'items',
                    uuid: item.uuid,
                });
                if (result.success && result.url) {
                    setImageUrl(result.url);
                }
                setLoading(false);
            }
        };
        loadImage();
    }, [item.uuid, item.image_size_bytes]);

    if (loading) {
        return (
            <Avatar className="h-10 w-10">
                <AvatarFallback>
                    <Loader2 className="h-4 w-4 animate-spin" />
                </AvatarFallback>
            </Avatar>
        );
    }

    return (
        <Avatar className="h-10 w-10">
            {imageUrl ? (
                <AvatarImage src={imageUrl} alt={item.name} />
            ) : (
                <AvatarFallback>{item.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
        </Avatar>
    );
});

ItemImage.displayName = 'ItemImage';