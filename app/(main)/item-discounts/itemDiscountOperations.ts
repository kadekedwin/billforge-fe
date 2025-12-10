import {createItemDiscount, updateItemDiscount, deleteItemDiscount} from "@/lib/api/item-discounts";
import { ApiError } from "@/lib/api/errors";
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

        return {success: true, discount: response.data};
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.errors) {
                const errors: Record<string, string> = {};
                Object.keys(err.errors).forEach((key) => {
                    errors[key] = err.errors![key][0];
                });
                return {success: false, errors};
            }
            return {success: false, error: err.message};
        }
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

        return {success: true, discount: response.data};
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.errors) {
                const errors: Record<string, string> = {};
                Object.keys(err.errors).forEach((key) => {
                    errors[key] = err.errors![key][0];
                });
                return {success: false, errors};
            }
            return {success: false, error: err.message};
        }
        return {success: false, error: "An error occurred while updating discount"};
    }
}

export async function handleDeleteItemDiscount(discount: ItemDiscount): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteItemDiscount(discount.uuid);

        return {success: true};
    } catch (err) {
        if (err instanceof ApiError) {
            return {success: false, error: err.message};
        }
        return {success: false, error: "An error occurred while deleting discount"};
    }
}
