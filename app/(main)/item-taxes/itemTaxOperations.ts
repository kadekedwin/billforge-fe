import { createItemTax, updateItemTax, deleteItemTax } from "@/lib/api/item-taxes";
import { ApiError } from "@/lib/api/errors";
import type { ItemTax, CreateItemTaxRequest, UpdateItemTaxRequest } from "@/lib/api";

interface CreateItemTaxParams {
    formData: Omit<CreateItemTaxRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleCreateItemTax({
    formData,
    businessUuid,
    t,
}: CreateItemTaxParams & { t: (key: string) => string }): Promise<{ success: boolean; tax?: ItemTax; error?: string; errors?: Record<string, string> }> {
    try {
        const response = await createItemTax({
            ...formData,
            business_uuid: businessUuid,
        });

        return { success: true, tax: response.data };
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
        return { success: false, error: t('app.itemTaxes.errorCreating') };
    }
}

interface UpdateItemTaxParams {
    tax: ItemTax;
    formData: Omit<CreateItemTaxRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleUpdateItemTax({
    tax,
    formData,
    businessUuid,
    t,
}: UpdateItemTaxParams & { t: (key: string) => string }): Promise<{ success: boolean; tax?: ItemTax; error?: string; errors?: Record<string, string> }> {
    try {
        const updateData: UpdateItemTaxRequest = {
            business_uuid: businessUuid,
            name: formData.name,
            type: formData.type,
            value: formData.value,
        };

        const response = await updateItemTax(tax.uuid, updateData);

        return { success: true, tax: response.data };
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
        return { success: false, error: t('app.itemTaxes.errorUpdating') };
    }
}

export async function handleDeleteItemTax(tax: ItemTax, t: (key: string) => string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteItemTax(tax.uuid);

        return { success: true };
    } catch (err) {
        if (err instanceof ApiError) {
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.itemTaxes.errorDeleting') };
    }
}
