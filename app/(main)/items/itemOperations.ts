import { createItem, updateItem, deleteItem } from "@/lib/api/items";
import { attachCategoryToItem, detachCategoryFromItem } from "@/lib/api/item-categories";
import { uploadImage, deleteImage } from "@/lib/images/operations";
import { deleteImageFromCache, ImageFolder } from "@/lib/db/images";
import { getFileSizeBytes } from "@/lib/images/utils";
import { ApiError } from "@/lib/api/errors";
import type { Item, CreateItemRequest, UpdateItemRequest } from "@/lib/api";

interface CreateItemParams {
    formData: Omit<CreateItemRequest, 'business_uuid'>;
    businessUuid: string;
    selectedImage: File | null;
    categoryUuids: string[];
    t: (key: string) => string;
}

export async function handleCreateItem({
    formData,
    businessUuid,
    selectedImage,
    categoryUuids,
    t,
}: CreateItemParams): Promise<{ success: boolean; item?: Item; error?: string; errors?: Record<string, string> }> {
    try {
        let imageSizeBytes: number | null = null;

        const createData: CreateItemRequest = {
            ...formData,
            business_uuid: businessUuid,
            image_size_bytes: null,
        };

        const response = await createItem(createData);
        const createdItemUuid = response.data.uuid;

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

        if (categoryUuids.length > 0 && createdItemUuid) {
            for (const categoryUuid of categoryUuids) {
                await attachCategoryToItem(createdItemUuid, { category_uuid: categoryUuid });
            }
        }

        return { success: true, item: response.data };
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
        return { success: false, error: t('app.items.errorCreating') };
    }
}

interface UpdateItemParams {
    item: Item;
    formData: Omit<CreateItemRequest, 'business_uuid'>;
    businessUuid: string;
    selectedImage: File | null;
    imageDeleted: boolean;
    existingImageUrl: string | null;
    selectedCategoryUuids: string[];
    initialCategoryUuids: string[];
    t: (key: string) => string;
}

export async function handleUpdateItem({
    item,
    formData,
    businessUuid,
    selectedImage,
    imageDeleted,
    existingImageUrl,
    selectedCategoryUuids,
    initialCategoryUuids,
    t,
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
                return { success: false, error: uploadResult.error || t('app.items.uploadError') };
            }
            imageSizeBytes = getFileSizeBytes(selectedImage);
        } else if (imageDeleted) {
            await deleteImage({
                folder: 'items',
                uuid: item.uuid,
            });
            await deleteImageFromCache(item.uuid, ImageFolder.ITEMS);
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

        const categoriesToAttach = selectedCategoryUuids.filter(uuid => !initialCategoryUuids.includes(uuid));
        const categoriesToDetach = initialCategoryUuids.filter(uuid => !selectedCategoryUuids.includes(uuid));

        for (const categoryUuid of categoriesToAttach) {
            await attachCategoryToItem(item.uuid, { category_uuid: categoryUuid });
        }

        for (const categoryUuid of categoriesToDetach) {
            await detachCategoryFromItem(item.uuid, categoryUuid);
        }

        return { success: true, item: response.data };
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
        return { success: false, error: t('app.items.errorUpdating') };
    }
}

export async function handleDeleteItem(item: Item, t: (key: string) => string): Promise<{ success: boolean; error?: string }> {
    try {
        if (item.image_size_bytes) {
            await deleteImage({
                folder: 'items',
                uuid: item.uuid,
            });
            await deleteImageFromCache(item.uuid, ImageFolder.ITEMS);
        }

        await deleteItem(item.uuid);

        return { success: true };
    } catch (err) {
        if (err instanceof ApiError) {
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.items.errorDeleting') };
    }
}