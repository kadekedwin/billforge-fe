"use client";

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
import type { ItemDiscount } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface DeleteItemDiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discount: ItemDiscount | null;
    onConfirm: () => void;
}

export function DeleteItemDiscountDialog({
    open,
    onOpenChange,
    discount,
    onConfirm,
}: DeleteItemDiscountDialogProps) {
    const { t } = useTranslation();
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('app.itemDiscounts.deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('app.itemDiscounts.deleteDescription', { name: discount?.name || '' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        {t('common.delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}