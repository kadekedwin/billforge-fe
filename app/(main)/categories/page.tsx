"use client";

import { useState } from "react";
import { useBusiness } from "@/contexts/business-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import type { Category } from "@/lib/api";
import { CategoriesTable } from "./CategoriesTable";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { useCategoriesData } from "./useCategoriesData";
import { useCategoryForm } from "./useCategoryForm";
import { handleCreateCategory, handleUpdateCategory, handleDeleteCategory } from "./categoryOperations";

export default function CategoriesPage() {
    const { selectedBusiness } = useBusiness();
    const { categories, isLoading, error, setCategories, setError } = useCategoriesData(selectedBusiness);
    const {
        formData,
        formErrors,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadCategoryForEdit,
    } = useCategoryForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        const result = editingCategory
            ? await handleUpdateCategory({
                category: editingCategory,
                formData,
            })
            : await handleCreateCategory({
                formData,
                businessUuid: selectedBusiness.uuid,
            });

        if (result.success && result.category) {
            if (editingCategory) {
                setCategories((prev) =>
                    prev.map((category) =>
                        category.uuid === editingCategory.uuid ? result.category! : category
                    )
                );
            } else {
                setCategories((prev) => [...prev, result.category!]);
            }
            setIsDialogOpen(false);
            setEditingCategory(null);
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

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;

        setDeletingId(categoryToDelete.id);
        setError(null);

        const result = await handleDeleteCategory(categoryToDelete);

        if (result.success) {
            setCategories((prev) => prev.filter((category) => category.uuid !== categoryToDelete.uuid));
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
        } else {
            setError(result.error || "Failed to delete category");
        }

        setDeletingId(null);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        loadCategoryForEdit(category);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingCategory(null);
            resetForm();
            setFormErrors({});
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={(e) => {
                                if (categories.length >= LIMITS.MAX_CATEGORIES) {
                                    e.preventDefault();
                                    setError(getLimitMessage('MAX_CATEGORIES'));
                                }
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <CategoryFormDialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogClose}
                        editingCategory={editingCategory}
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

            <CategoriesTable
                categories={categories}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAddFirst={() => setIsDialogOpen(true)}
            />

            <DeleteCategoryDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                category={categoryToDelete}
                isDeleting={!!deletingId}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}
