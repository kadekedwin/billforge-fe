"use client";

import { memo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import type { Item } from "@/lib/api";
import { useImage } from "@/hooks/use-image";
import { ImageFolder } from "@/lib/db/images";

interface ItemImageProps {
    item: Item;
}

export const ItemImage = memo(({ item }: ItemImageProps) => {
    const { imageUrl, loading } = useImage({
        uuid: item.uuid,
        updatedAt: item.updated_at,
        imageSizeBytes: item.image_size_bytes,
        folder: ImageFolder.ITEMS,
    });

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