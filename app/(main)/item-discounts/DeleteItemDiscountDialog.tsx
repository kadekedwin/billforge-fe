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
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the discount &quot;{discount?.name}&quot;.
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}