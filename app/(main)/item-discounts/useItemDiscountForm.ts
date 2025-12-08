"use client";

import { useState } from "react";
import type { ItemDiscount, CreateItemDiscountRequest } from "@/lib/api";

interface UseItemDiscountFormResult {
    formData: Omit<CreateItemDiscountRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<Omit<CreateItemDiscountRequest, 'business_uuid'>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    resetForm: () => void;
    loadDiscountForEdit: (discount: ItemDiscount) => void;
}

const initialFormData: Omit<CreateItemDiscountRequest, 'business_uuid'> = {
    name: "",
    type: "percentage",
    value: 0,
};

export function useItemDiscountForm(): UseItemDiscountFormResult {
    const [formData, setFormData] = useState<Omit<CreateItemDiscountRequest, 'business_uuid'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number = value;

        if (name === "value") {
            processedValue = parseFloat(value) || 0;
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

    const resetForm = () => {
        setFormData(initialFormData);
        setFormErrors({});
    };

    const loadDiscountForEdit = (discount: ItemDiscount) => {
        setFormData({
            name: discount.name,
            type: discount.type,
            value: parseFloat(discount.value),
        });
    };

    return {
        formData,
        formErrors,
        setFormData,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadDiscountForEdit,
    };
}