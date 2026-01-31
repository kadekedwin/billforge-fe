"use client";

import { memo } from "react";
import { Building2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Business } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useImage } from "@/hooks/use-image";
import { ImageFolder } from "@/lib/db/images";

interface BusinessLogoProps {
    business: Business;
    size?: "sm" | "lg";
}

export const BusinessLogo = memo(({ business, size = "sm" }: BusinessLogoProps) => {
    const { imageUrl, loading } = useImage({
        uuid: business.uuid,
        updatedAt: business.updated_at,
        imageSizeBytes: business.image_size_bytes,
        folder: ImageFolder.BUSINESSES,
    });

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