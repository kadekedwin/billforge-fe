"use client";

import { useState } from "react";
import type { Category, CreateCategoryRequest } from "@/lib/api";

interface UseCategoryFormResult {
    formData: Omit<CreateCategoryRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<Omit<CreateCategoryRequest, 'business_uuid'>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetForm: () => void;
    loadCategoryForEdit: (category: Category) => void;
}

const initialFormData: Omit<CreateCategoryRequest, 'business_uuid'> = {
    name: "",
};

export function useCategoryForm(): UseCategoryFormResult {
    const [formData, setFormData] = useState<Omit<CreateCategoryRequest, 'business_uuid'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setFormErrors({});
    };

    const loadCategoryForEdit = (category: Category) => {
        setFormData({
            name: category.name,
        });
    };

    return {
        formData,
        formErrors,
        setFormData,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadCategoryForEdit,
    };
}
