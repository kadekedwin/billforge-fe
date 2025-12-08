"use client";

import { useState } from "react";
import { useBusiness } from "@/contexts/business-context";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import type { Item } from "@/lib/api";
import { ItemsTable } from "./ItemsTable";
import { ItemFormDialog } from "./ItemFormDialog";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { useItemsData } from "./useItemsData";
import { useItemForm } from "./useItemForm";
import { handleCreateItem, handleUpdateItem, handleDeleteItem } from "./itemOperations";

export default function ItemsPage() {
    const { selectedBusiness, businesses } = useBusiness();
    const { items, taxes, discounts, isLoading, error, setItems, setError } = useItemsData(selectedBusiness);
    const {
        formData,
        formErrors,
        selectedImage,
        imagePreview,
        existingImageUrl,
        imageDeleted,
        setFormErrors,
        handleInputChange,
        handleSwitchChange,
        handleImageChange,
        handleRemoveImage,
        resetForm,
        loadItemForEdit,
    } = useItemForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingItem, setEditingItem] = useState<Item | null>(null);

    const getBusinessName = (business_uuid: string) => {
        const business = businesses.find(b => b.uuid === business_uuid);
        return business?.name || "Unknown Business";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        if (selectedImage) {
            setIsUploadingImage(true);
        }

        const result = editingItem
            ? await handleUpdateItem({
                item: editingItem,
                formData,
                businessUuid: selectedBusiness.uuid,
                selectedImage,
                imageDeleted,
                existingImageUrl,
            })
            : await handleCreateItem({
                formData,
                businessUuid: selectedBusiness.uuid,
                selectedImage,
            });

        setIsUploadingImage(false);

        if (result.success && result.item) {
            if (editingItem) {
                setItems((prev) =>
                    prev.map((item) =>
                        item.uuid === editingItem.uuid ? result.item! : item
                    )
                );
            } else {
                setItems((prev) => [...prev, result.item!]);
            }
            setIsDialogOpen(false);
            setEditingItem(null);
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

    const handleDeleteClick = (item: Item) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        setDeletingId(itemToDelete.id);
        setError(null);

        const result = await handleDeleteItem(itemToDelete);

        if (result.success) {
            setItems((prev) => prev.filter((item) => item.uuid !== itemToDelete.uuid));
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        } else {
            setError(result.error || "Failed to delete item");
        }

        setDeletingId(null);
    };

    const handleEdit = async (item: Item) => {
        setEditingItem(item);
        await loadItemForEdit(item);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingItem(null);
            resetForm();
            setFormErrors({});
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Items</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={(e) => {
                                if (items.length >= LIMITS.MAX_ITEMS) {
                                    e.preventDefault();
                                    setError(getLimitMessage('MAX_ITEMS'));
                                }
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>
                    </DialogTrigger>
                    <ItemFormDialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogClose}
                        editingItem={editingItem}
                        formData={formData}
                        formErrors={formErrors}
                        error={error}
                        taxes={taxes}
                        discounts={discounts}
                        imagePreview={imagePreview}
                        isSubmitting={isSubmitting}
                        isUploadingImage={isUploadingImage}
                        onInputChange={handleInputChange}
                        onSwitchChange={handleSwitchChange}
                        onImageChange={(e) => handleImageChange(e, setError)}
                        onRemoveImage={handleRemoveImage}
                        onSubmit={handleSubmit}
                    />
                </Dialog>
            </div>

            {error && !isDialogOpen && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <ItemsTable
                items={items}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAddFirst={() => setIsDialogOpen(true)}
                getBusinessName={getBusinessName}
            />

            <DeleteItemDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                item={itemToDelete}
                isDeleting={!!deletingId}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}