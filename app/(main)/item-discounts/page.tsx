"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useBusiness } from "@/contexts/business-context";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import type { ItemDiscount } from "@/lib/api";
import { ItemDiscountsTable } from "./ItemDiscountsTable";
import { ItemDiscountFormDialog } from "./ItemDiscountFormDialog";
import { DeleteItemDiscountDialog } from "./DeleteItemDiscountDialog";
import { useItemDiscountsData } from "./useItemDiscountsData";
import { useItemDiscountForm } from "./useItemDiscountForm";
import { handleCreateItemDiscount, handleUpdateItemDiscount, handleDeleteItemDiscount } from "./itemDiscountOperations";

export default function ItemDiscountsPage() {
    const { selectedBusiness } = useBusiness();
    const { discounts, isLoading, error, setDiscounts, setError } = useItemDiscountsData(selectedBusiness);
    const {
        formData,
        formErrors,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadDiscountForEdit,
    } = useItemDiscountForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<ItemDiscount | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingDiscount, setEditingDiscount] = useState<ItemDiscount | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        const result = editingDiscount
            ? await handleUpdateItemDiscount({
                discount: editingDiscount,
                formData,
                businessUuid: selectedBusiness.uuid,
            })
            : await handleCreateItemDiscount({
                formData,
                businessUuid: selectedBusiness.uuid,
            });

        if (result.success && result.discount) {
            if (editingDiscount) {
                setDiscounts((prev) =>
                    prev.map((discount) =>
                        discount.uuid === editingDiscount.uuid ? result.discount! : discount
                    )
                );
            } else {
                setDiscounts((prev) => [...prev, result.discount!]);
            }
            setIsDialogOpen(false);
            setEditingDiscount(null);
            resetForm();
        } else {
            if (result.errors) {
                setFormErrors(result.errors);
            } else if (result.error) {
                setError(result.error);
            }
        }

        setIsSubmitting(false);
    };

    const handleDeleteClick = (discount: ItemDiscount) => {
        setDiscountToDelete(discount);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!discountToDelete) return;

        setDeletingId(discountToDelete.id);
        setError(null);

        const result = await handleDeleteItemDiscount(discountToDelete);

        if (result.success) {
            setDiscounts((prev) => prev.filter((discount) => discount.uuid !== discountToDelete.uuid));
            setIsDeleteDialogOpen(false);
            setDiscountToDelete(null);
        } else {
            setError(result.error || "Failed to delete discount");
        }

        setDeletingId(null);
    };

    const handleEdit = (discount: ItemDiscount) => {
        setEditingDiscount(discount);
        loadDiscountForEdit(discount);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingDiscount(null);
            resetForm();
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Item Discounts</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={(e) => {
                                if (discounts.length >= LIMITS.MAX_DISCOUNTS) {
                                    e.preventDefault();
                                    setError(getLimitMessage('MAX_DISCOUNTS'));
                                }
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Discount
                        </Button>
                    </DialogTrigger>
                    <ItemDiscountFormDialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogClose}
                        editingDiscount={editingDiscount}
                        formData={formData}
                        formErrors={formErrors}
                        error={error}
                        isSubmitting={isSubmitting}
                        onInputChange={handleInputChange}
                        onSubmit={handleSubmit}
                    />
                </Dialog>
            </div>

            {error && !isDialogOpen && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <ItemDiscountsTable
                discounts={discounts}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <DeleteItemDiscountDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                discount={discountToDelete}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}

