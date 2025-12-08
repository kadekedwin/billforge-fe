import {createItemDiscount, updateItemDiscount, deleteItemDiscount} from "@/lib/api/item-discounts";
import type {ItemDiscount, CreateItemDiscountRequest, UpdateItemDiscountRequest} from "@/lib/api";

interface CreateItemDiscountParams {
    formData: Omit<CreateItemDiscountRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleCreateItemDiscount({
                                                   formData,
                                                   businessUuid,
                                               }: CreateItemDiscountParams): Promise<{
    success: boolean;
    discount?: ItemDiscount;
    error?: string;
    errors?: Record<string, string>
}> {
    try {
        const createData: CreateItemDiscountRequest = {
            ...formData,
            business_uuid: businessUuid,
        };

        const response = await createItemDiscount(createData);

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
                return {success: false, errors};
            }

            return {success: false, error: errorData.message || "Failed to create discount"};
        }

        return {success: true, discount: response.data};
    } catch (err) {
        return {success: false, error: "An error occurred while creating discount"};
    }
}

interface UpdateItemDiscountParams {
    discount: ItemDiscount;
    formData: Omit<CreateItemDiscountRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleUpdateItemDiscount({
                                                   discount,
                                                   formData,
                                                   businessUuid,
                                               }: UpdateItemDiscountParams): Promise<{
    success: boolean;
    discount?: ItemDiscount;
    error?: string;
    errors?: Record<string, string>
}> {
    try {
        const updateData: UpdateItemDiscountRequest = {
            business_uuid: businessUuid,
            name: formData.name,
            type: formData.type,
            value: formData.value,
        };

        const response = await updateItemDiscount(discount.uuid, updateData);

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
                return {success: false, errors};
            }

            return {success: false, error: errorData.message || "Failed to update discount"};
        }

        return {success: true, discount: response.data};
    } catch (_err) {
        return {success: false, error: "An error occurred while updating discount"};
    }
}

export async function handleDeleteItemDiscount(discount: ItemDiscount): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await deleteItemDiscount(discount.uuid);

        if (!response.success) {
            const errorData = response as unknown as {
                success: false;
                message: string;
            };
            return {success: false, error: errorData.message || "Failed to delete discount"};
        }

        return {success: true};
    } catch (_err) {
        return {success: false, error: "An error occurred while deleting discount"};
    }
}

