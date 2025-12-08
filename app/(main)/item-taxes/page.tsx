"use client";

import { useState } from "react";
import { useBusiness } from "@/contexts/business-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import type { ItemTax } from "@/lib/api";
import { ItemTaxesTable } from "./ItemTaxesTable";
import { ItemTaxFormDialog } from "./ItemTaxFormDialog";
import { DeleteItemTaxDialog } from "./DeleteItemTaxDialog";
import { useItemTaxesData } from "./useItemTaxesData";
import { useItemTaxForm } from "./useItemTaxForm";
import {
    handleCreateItemTax,
    handleUpdateItemTax,
    handleDeleteItemTax,
} from "./itemTaxOperations";

export default function ItemTaxesPage() {
    const { selectedBusiness } = useBusiness();
    const { taxes, isLoading, error, setTaxes, setError } = useItemTaxesData(selectedBusiness);
    const {
        formData,
        formErrors,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadTaxForEdit,
    } = useItemTaxForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taxToDelete, setTaxToDelete] = useState<ItemTax | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingTax, setEditingTax] = useState<ItemTax | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        const result = editingTax
            ? await handleUpdateItemTax({
                tax: editingTax,
                formData,
                businessUuid: selectedBusiness.uuid,
            })
            : await handleCreateItemTax({
                formData,
                businessUuid: selectedBusiness.uuid,
            });

        if (result.success && result.tax) {
            if (editingTax) {
                setTaxes((prev) =>
                    prev.map((tax) =>
                        tax.uuid === editingTax.uuid ? result.tax! : tax
                    )
                );
            } else {
                setTaxes((prev) => [...prev, result.tax!]);
            }
            setIsDialogOpen(false);
            setEditingTax(null);
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

    const handleDeleteClick = (tax: ItemTax) => {
        setTaxToDelete(tax);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!taxToDelete) return;

        setDeletingId(taxToDelete.id);
        setError(null);

        const result = await handleDeleteItemTax(taxToDelete);

        if (result.success) {
            setTaxes((prev) => prev.filter((tax) => tax.uuid !== taxToDelete.uuid));
            setIsDeleteDialogOpen(false);
            setTaxToDelete(null);
        } else {
            setError(result.error || "Failed to delete tax");
        }

        setDeletingId(null);
    };

    const handleEdit = (tax: ItemTax) => {
        setEditingTax(tax);
        loadTaxForEdit(tax);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingTax(null);
            resetForm();
            setFormErrors({});
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Item Taxes</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={(e) => {
                                if (taxes.length >= LIMITS.MAX_TAXES) {
                                    e.preventDefault();
                                    setError(getLimitMessage('MAX_TAXES'));
                                }
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tax
                        </Button>
                    </DialogTrigger>
                    <ItemTaxFormDialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogClose}
                        editingTax={editingTax}
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

            <ItemTaxesTable
                taxes={taxes}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <DeleteItemTaxDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                tax={taxToDelete}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}