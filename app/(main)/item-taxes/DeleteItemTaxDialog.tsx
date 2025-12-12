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
import type { ItemTax } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface DeleteItemTaxDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tax: ItemTax | null;
    onConfirm: () => void;
}

export function DeleteItemTaxDialog({
    open,
    onOpenChange,
    tax,
    onConfirm,
}: DeleteItemTaxDialogProps) {
    const { t } = useTranslation();
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('app.itemTaxes.deleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('app.itemTaxes.deleteDescription', { name: tax?.name || '' })}
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