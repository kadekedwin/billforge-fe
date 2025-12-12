import { createCategory, updateCategory, deleteCategory } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/errors";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "@/lib/api";

interface CreateCategoryParams {
    formData: Omit<CreateCategoryRequest, 'business_uuid'>;
    businessUuid: string;
    t: (key: string) => string;
}

export async function handleCreateCategory({
    formData,
    businessUuid,
    t,
}: CreateCategoryParams): Promise<{ success: boolean; category?: Category; error?: string; errors?: Record<string, string> }> {
    try {
        const createData: CreateCategoryRequest = {
            ...formData,
            business_uuid: businessUuid,
        };

        const response = await createCategory(createData);

        return { success: true, category: response.data };
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.errors) {
                const errors: Record<string, string> = {};
                Object.keys(err.errors).forEach((key) => {
                    errors[key] = err.errors![key][0];
                });
                return { success: false, errors };
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.categories.errorCreating') };
    }
}

interface UpdateCategoryParams {
    category: Category;
    formData: Omit<CreateCategoryRequest, 'business_uuid'>;
    t: (key: string) => string;
}

export async function handleUpdateCategory({
    category,
    formData,
    t,
}: UpdateCategoryParams): Promise<{ success: boolean; category?: Category; error?: string; errors?: Record<string, string> }> {
    try {
        const updateData: UpdateCategoryRequest = {
            name: formData.name,
        };

        const response = await updateCategory(category.uuid, updateData);

        return { success: true, category: response.data };
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.errors) {
                const errors: Record<string, string> = {};
                Object.keys(err.errors).forEach((key) => {
                    errors[key] = err.errors![key][0];
                });
                return { success: false, errors };
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.categories.errorUpdating') };
    }
}

export async function handleDeleteCategory(category: Category, t: (key: string) => string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteCategory(category.uuid);

        return { success: true };
    } catch (err) {
        if (err instanceof ApiError) {
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.categories.errorDeleting') };
    }
}
