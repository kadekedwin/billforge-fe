"use client";

import { memo } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import type { Item } from "@/lib/api";
import { useImage } from "@/hooks/use-image";
import { ImageFolder } from "@/lib/db/images";

interface ItemImageCardProps {
    item: Item;
}

export const ItemImageCard = memo(({ item }: ItemImageCardProps) => {
    const { imageUrl, loading } = useImage({
        uuid: item.uuid,
        updatedAt: item.updated_at,
        imageSizeBytes: item.image_size_bytes,
        folder: ImageFolder.ITEMS,
    });

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
                className="object-contain transition-transform group-hover:scale-105"
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