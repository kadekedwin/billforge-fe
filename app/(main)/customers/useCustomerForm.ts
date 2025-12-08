"use client";

import { useState } from "react";
import type { Customer, CreateCustomerRequest } from "@/lib/api";

interface UseCustomerFormResult {
    formData: Omit<CreateCustomerRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<Omit<CreateCustomerRequest, 'business_uuid'>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    resetForm: () => void;
    loadCustomerForEdit: (customer: Customer) => void;
}

const initialFormData: Omit<CreateCustomerRequest, 'business_uuid'> = {
    name: "",
    email: null,
    address: null,
    phone: null,
};

export function useCustomerForm(): UseCustomerFormResult {
    const [formData, setFormData] = useState<Omit<CreateCustomerRequest, 'business_uuid'>>(initialFormData);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let processedValue: string | null = value;

        if ((name === "email" || name === "address" || name === "phone") && value === "") {
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

    const resetForm = () => {
        setFormData(initialFormData);
        setFormErrors({});
    };

    const loadCustomerForEdit = (customer: Customer) => {
        setFormData({
            name: customer.name,
            email: customer.email,
            address: customer.address,
            phone: customer.phone,
        });
    };

    return {
        formData,
        formErrors,
        setFormData,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadCustomerForEdit,
    };
}