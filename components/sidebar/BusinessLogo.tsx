"use client";

import { useState, useEffect, memo } from "react";
import { Building2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/images/operations";
import { Business } from "@/lib/api";
import { cn } from "@/lib/utils";

interface BusinessLogoProps {
    business: Business;
    size?: "sm" | "lg";
}

const imageUrlCache = new Map<string, string>();

export const BusinessLogo = memo(({ business, size = "sm" }: BusinessLogoProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cacheKey = `${business.uuid}-${business.updated_at}`;

        if (imageUrlCache.has(cacheKey)) {
            setImageUrl(imageUrlCache.get(cacheKey)!);
            return;
        }

        const loadImage = async () => {
            if (business.image_size_bytes) {
                setLoading(true);
                const result = await getImageUrl({
                    folder: 'businesses',
                    uuid: business.uuid,
                });
                if (result.success && result.url) {
                    imageUrlCache.set(cacheKey, result.url);
                    setImageUrl(result.url);
                }
                setLoading(false);
            }
        };
        loadImage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [business.uuid, business.image_size_bytes]);

    const sizeClasses = size === "lg" ? "h-8 w-8" : "h-4 w-4";

    if (loading) {
        return <Loader2 className={cn(sizeClasses, "animate-spin")} />;
    }

    if (imageUrl) {
        return (
            <Avatar className={sizeClasses}>
                <AvatarImage src={imageUrl} alt={business.name} />
                <AvatarFallback>{business.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
        );
    }

    return <Building2 className={sizeClasses} />;
});

BusinessLogo.displayName = 'BusinessLogo';