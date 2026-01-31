"use client";

import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { logout } from "@/lib/api/auth";
import { useImage } from "@/hooks/use-image";
import { ImageFolder } from "@/lib/db/images";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface UserProfileProps {
    onNavigate?: () => void;
}

export function UserProfile({ onNavigate }: UserProfileProps) {
    const { t } = useTranslation();
    const { user, removeAuth } = useAuth();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const { imageUrl: userImageUrl } = useImage({
        uuid: user?.uuid || "",
        updatedAt: user?.updated_at || "",
        imageSizeBytes: user?.image_size_bytes || null,
        folder: ImageFolder.USER,
    });

    const handleLogout = async () => {
        setShowLogoutDialog(false);
        try {
            const response = await logout();

            if (response.success) {
                // Successfully logged out
            } else {
                console.error("Logout error:", response.message);
            }
        } catch (err) {
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
                    <DropdownMenuLabel>{t('sidebar.userProfile.myAccount')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('sidebar.userProfile.logout')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('sidebar.userProfile.dialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('sidebar.userProfile.dialog.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowLogoutDialog(false)}
                        >
                            {t('sidebar.userProfile.dialog.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {t('sidebar.userProfile.dialog.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}