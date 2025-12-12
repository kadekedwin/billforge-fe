"use client";

import { useState } from "react";
import type { Item, CreateItemRequest } from "@/lib/api";
import { getImageUrl } from "@/lib/images/operations";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface UseItemFormResult {
    formData: Omit<CreateItemRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    selectedImage: File | null;
    imagePreview: string | null;
    existingImageUrl: string | null;
    imageDeleted: boolean;
    selectedCategoryUuids: string[];
    initialCategoryUuids: string[];
    setFormData: React.Dispatch<React.SetStateAction<Omit<CreateItemRequest, 'business_uuid'>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setSelectedImage: React.Dispatch<React.SetStateAction<File | null>>;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    setExistingImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
    setImageDeleted: React.Dispatch<React.SetStateAction<boolean>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleSwitchChange: (checked: boolean) => void;
    handleCategoryChange: (categoryUuid: string) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>, onError: (error: string) => void) => void;
    handleRemoveImage: () => void;
    resetForm: () => void;
    loadItemForEdit: (item: Item, categoryUuids: string[]) => Promise<void>;
}

const initialFormData: Omit<CreateItemRequest, 'business_uuid'> = {
    discount_uuid: null,
    tax_uuid: null,
    name: "",
    sku: null,
    description: null,
    base_price: 0,
    is_active: true,
    image_size_bytes: null,
};

export function useItemForm(): UseItemFormResult {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Omit<CreateItemRequest, 'business_uuid'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [imageDeleted, setImageDeleted] = useState(false);
    const [selectedCategoryUuids, setSelectedCategoryUuids] = useState<string[]>([]);
    const [initialCategoryUuids, setInitialCategoryUuids] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number | undefined | null = value;

        if (name === "base_price") {
            processedValue = parseFloat(value) || 0;
        } else if ((name === "tax_uuid" || name === "discount_uuid") && value === "") {
            processedValue = null;
        } else if ((name === "sku" || name === "description") && value === "") {
            processedValue = null;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, is_active: checked }));
    };

    const handleCategoryChange = (categoryUuid: string) => {
        setSelectedCategoryUuids((prev) => {
            const isSelected = prev.includes(categoryUuid);
            return isSelected
                ? prev.filter(uuid => uuid !== categoryUuid)
                : [...prev, categoryUuid];
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, onError: (error: string) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                onError(t('app.items.selectImageError'));
                return;
            }
            if (file.size > 1048576) {
                onError(t('app.items.imageSizeError'));
                e.target.value = '';
                return;
            }
            setSelectedImage(file);
            setImageDeleted(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setImageDeleted(true);
        setExistingImageUrl(null);
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setFormErrors({});
        setSelectedImage(null);
        setImagePreview(null);
        setExistingImageUrl(null);
        setImageDeleted(false);
        setSelectedCategoryUuids([]);
        setInitialCategoryUuids([]);
    };

    const loadItemForEdit = async (item: Item, categoryUuids: string[]) => {
        setFormData({
            discount_uuid: item.discount_uuid,
            tax_uuid: item.tax_uuid,
            name: item.name,
            sku: item.sku,
            description: item.description,
            base_price: parseFloat(item.base_price),
            is_active: item.is_active,
            image_size_bytes: item.image_size_bytes,
        });
        setSelectedImage(null);
        setImagePreview(null);
        setImageDeleted(false);
        setSelectedCategoryUuids(categoryUuids);
        setInitialCategoryUuids(categoryUuids);

        if (item.image_size_bytes) {
            const imageResult = await getImageUrl({
                folder: 'items',
                uuid: item.uuid,
            });
            if (imageResult.success && imageResult.url) {
                setExistingImageUrl(imageResult.url);
                setImagePreview(imageResult.url);
            } else {
                setExistingImageUrl(null);
            }
        } else {
            setExistingImageUrl(null);
        }
    };

    return {
        formData,
        formErrors,
        selectedImage,
        imagePreview,
        existingImageUrl,
        imageDeleted,
        selectedCategoryUuids,
        initialCategoryUuids,
        setFormData,
        setFormErrors,
        setSelectedImage,
        setImagePreview,
        setExistingImageUrl,
        setImageDeleted,
        handleInputChange,
        handleSwitchChange,
        handleCategoryChange,
        handleImageChange,
        handleRemoveImage,
        resetForm,
        loadItemForEdit,
    };
}