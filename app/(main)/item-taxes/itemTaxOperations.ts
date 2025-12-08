import { createItemTax, updateItemTax, deleteItemTax } from "@/lib/api/item-taxes";
import type { ItemTax, CreateItemTaxRequest, UpdateItemTaxRequest } from "@/lib/api";

interface CreateItemTaxParams {
    formData: Omit<CreateItemTaxRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleCreateItemTax({
                                              formData,
                                              businessUuid,
                                          }: CreateItemTaxParams): Promise<{ success: boolean; tax?: ItemTax; error?: string; errors?: Record<string, string> }> {
    try {
        const response = await createItemTax({
            ...formData,
            business_uuid: businessUuid,
        });

        if (!response.success) {
            const errorData = response as unknown as {
                success: false;
                message: string;
                errors?: Record<string, string[]>;
            };

            if (errorData.errors) {
                const errors: Record<string, string> = {};
                Object.keys(errorData.errors).forEach((key) => {
                    if (errorData.errors) {
                        errors[key] = errorData.errors[key][0];
                    }
                });
                return { success: false, errors };
            }

            return { success: false, error: errorData.message || "Failed to create tax" };
        }

        return { success: true, tax: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while creating tax" };
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
                                          }: UpdateItemTaxParams): Promise<{ success: boolean; tax?: ItemTax; error?: string; errors?: Record<string, string> }> {
    try {
        const updateData: UpdateItemTaxRequest = {
            business_uuid: businessUuid,
            name: formData.name,
            type: formData.type,
            value: formData.value,
        };

        const response = await updateItemTax(tax.uuid, updateData);

        if (!response.success) {
            const errorData = response as unknown as {
                success: false;
                message: string;
                errors?: Record<string, string[]>;
            };

            if (errorData.errors) {
                const errors: Record<string, string> = {};
                Object.keys(errorData.errors).forEach((key) => {
                    if (errorData.errors) {
                        errors[key] = errorData.errors[key][0];
                    }
                });
                return { success: false, errors };
            }

            return { success: false, error: errorData.message || "Failed to update tax" };
        }

        return { success: true, tax: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while updating tax" };
    }
}

export async function handleDeleteItemTax(tax: ItemTax): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await deleteItemTax(tax.uuid);

        if (!response.success) {
            const errorData = response as unknown as {
                success: false;
                message: string;
            };
            return { success: false, error: errorData.message || "Failed to delete tax" };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: "An error occurred while deleting tax" };
    }
}