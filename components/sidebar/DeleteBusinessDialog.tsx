"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Business } from "@/lib/api";
import { deleteBusiness } from "@/lib/api/businesses";
import { deleteImage } from "@/lib/images/operations";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface DeleteBusinessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    business: Business | null;
    onSuccess: () => void;
}

export function DeleteBusinessDialog({
    open,
    onOpenChange,
    business,
    onSuccess,
}: DeleteBusinessDialogProps) {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!business) return;

        try {
            setIsDeleting(true);

            // Delete logo if exists
            if (business.image_size_bytes) {
                await deleteImage({
                    folder: 'businesses',
                    uuid: business.uuid,
                });
            }

            const response = await deleteBusiness(business.uuid);
            if (response.success) {
                onOpenChange(false);
                onSuccess();
            }
        } catch (err) {
            console.error("Error deleting business:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('sidebar.deleteBusinessDialog.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('sidebar.deleteBusinessDialog.description', { name: business?.name || '' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{t('sidebar.deleteBusinessDialog.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('sidebar.deleteBusinessDialog.confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}