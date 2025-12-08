import { createItem, updateItem, deleteItem } from "@/lib/api/items";
import { uploadImage, deleteImage } from "@/lib/images/operations";
import { getFileSizeBytes } from "@/lib/images/utils";
import type { Item, CreateItemRequest, UpdateItemRequest } from "@/lib/api";

interface CreateItemParams {
    formData: Omit<CreateItemRequest, 'business_uuid'>;
    businessUuid: string;
    selectedImage: File | null;
}

export async function handleCreateItem({
                                           formData,
                                           businessUuid,
                                           selectedImage,
                                       }: CreateItemParams): Promise<{ success: boolean; item?: Item; error?: string; errors?: Record<string, string> }> {
    try {
        let imageSizeBytes: number | null = null;
        let createdItemUuid: string | null = null;

        const createData: CreateItemRequest = {
            ...formData,
            business_uuid: businessUuid,
            image_size_bytes: null,
        };

        const response = await createItem(createData);

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

            return { success: false, error: errorData.message || "Failed to create item" };
        }

        createdItemUuid = response.data.uuid;

        if (selectedImage && createdItemUuid) {
            const uploadResult = await uploadImage({
                file: selectedImage,
                folder: 'items',
                uuid: createdItemUuid,
            });

            if (uploadResult.success) {
                imageSizeBytes = getFileSizeBytes(selectedImage);
                await updateItem(response.data.uuid, { image_size_bytes: imageSizeBytes });
                response.data.image_size_bytes = imageSizeBytes;
            }
        }

        return { success: true, item: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while creating item" };
    }
}

interface UpdateItemParams {
    item: Item;
    formData: Omit<CreateItemRequest, 'business_uuid'>;
    businessUuid: string;
    selectedImage: File | null;
    imageDeleted: boolean;
    existingImageUrl: string | null;
}

export async function handleUpdateItem({
                                           item,
                                           formData,
                                           businessUuid,
                                           selectedImage,
                                           imageDeleted,
                                           existingImageUrl,
                                       }: UpdateItemParams): Promise<{ success: boolean; item?: Item; error?: string; errors?: Record<string, string> }> {
    try {
        let imageSizeBytes: number | null = null;

        if (selectedImage) {
            const uploadResult = await uploadImage({
                file: selectedImage,
                folder: 'items',
                uuid: item.uuid,
            });

            if (!uploadResult.success) {
                return { success: false, error: uploadResult.error || 'Failed to upload image' };
            }
            imageSizeBytes = getFileSizeBytes(selectedImage);
        } else if (imageDeleted) {
            await deleteImage({
                folder: 'items',
                uuid: item.uuid,
            });
            imageSizeBytes = null;
        } else if (existingImageUrl) {
            imageSizeBytes = item.image_size_bytes;
        }

        const updateData: UpdateItemRequest = {
            business_uuid: businessUuid,
            discount_uuid: formData.discount_uuid,
            tax_uuid: formData.tax_uuid,
            name: formData.name,
            sku: formData.sku,
            description: formData.description,
            base_price: formData.base_price,
            is_active: formData.is_active,
            image_size_bytes: imageSizeBytes,
        };

        const response = await updateItem(item.uuid, updateData);

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

            return { success: false, error: errorData.message || "Failed to update item" };
        }

        return { success: true, item: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while updating item" };
    }
}

export async function handleDeleteItem(item: Item): Promise<{ success: boolean; error?: string }> {
    try {
        if (item.image_size_bytes) {
            await deleteImage({
                folder: 'items',
                uuid: item.uuid,
            });
        }

        const response = await deleteItem(item.uuid);

        if (!response.success) {
            const errorData = response as unknown as {
                success: false;
                message: string;
            };
            return { success: false, error: errorData.message || "Failed to delete item" };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: "An error occurred while deleting item" };
    }
}