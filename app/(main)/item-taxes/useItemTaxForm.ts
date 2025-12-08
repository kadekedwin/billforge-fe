"use client";

import { useState } from "react";
import type { ItemTax, CreateItemTaxRequest } from "@/lib/api";

interface UseItemTaxFormResult {
    formData: Omit<CreateItemTaxRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<Omit<CreateItemTaxRequest, 'business_uuid'>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    resetForm: () => void;
    loadTaxForEdit: (tax: ItemTax) => void;
}

const initialFormData: Omit<CreateItemTaxRequest, 'business_uuid'> = {
    name: "",
    type: "percentage",
    value: 0,
};

export function useItemTaxForm(): UseItemTaxFormResult {
    const [formData, setFormData] = useState<Omit<CreateItemTaxRequest, 'business_uuid'>>(initialFormData);
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

    const loadTaxForEdit = (tax: ItemTax) => {
        setFormData({
            name: tax.name,
            type: tax.type,
            value: parseFloat(tax.value),
        });
    };

    return {
        formData,
        formErrors,
        setFormData,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadTaxForEdit,
    };
}