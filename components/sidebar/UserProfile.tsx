"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { getImageUrl } from "@/lib/images/operations";
import { logout } from "@/lib/api/auth";

interface UserProfileProps {
    onNavigate?: () => void;
}

const imageUrlCache = new Map<string, string>();

export function UserProfile({ onNavigate }: UserProfileProps) {
    const { user, removeAuth } = useAuth();
    const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setUserImageUrl(null);
            return;
        }

        const cacheKey = `${user.uuid}-${user.updated_at}`;

        if (imageUrlCache.has(cacheKey)) {
            setUserImageUrl(imageUrlCache.get(cacheKey)!);
            return;
        }

        const loadUserImage = async () => {
            if (user.image_size_bytes) {
                const result = await getImageUrl({
                    folder: 'users',
                    uuid: user.uuid,
                });
                if (result.success && result.url) {
                    imageUrlCache.set(cacheKey, result.url);
                    setUserImageUrl(result.url);
                }
            } else {
                setUserImageUrl(null);
            }
        };

        loadUserImage();
    }, [user?.uuid, user?.updated_at]);

    const handleLogout = async () => {
        try {
            const response = await logout();

            if (response.success) {
                // Successfully logged out
            } else {
                setError("Logout error");
                console.error("Logout error:", response.message);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Logout error:", err);
        } finally {
            removeAuth();
            onNavigate?.();
        }
    };

    return (
        <div className="border-t p-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-start space-x-3 px-2"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={userImageUrl || ""} />
                            <AvatarFallback>
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col items-start text-sm">
                            <span className="font-medium">{user?.name || "User"}</span>
                            <span className="text-xs text-muted-foreground">
                                {user?.email || ""}
                            </span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}