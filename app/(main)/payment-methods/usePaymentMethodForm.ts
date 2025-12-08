"use client";

import { useState } from "react";
import type { PaymentMethod, CreatePaymentMethodRequest } from "@/lib/api";

interface UsePaymentMethodFormResult {
    formData: Omit<CreatePaymentMethodRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    setFormData: React.Dispatch<React.SetStateAction<Omit<CreatePaymentMethodRequest, 'business_uuid'>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetForm: () => void;
    loadPaymentMethodForEdit: (paymentMethod: PaymentMethod) => void;
}

const initialFormData: Omit<CreatePaymentMethodRequest, 'business_uuid'> = {
    name: "",
};

export function usePaymentMethodForm(): UsePaymentMethodFormResult {
    const [formData, setFormData] = useState<Omit<CreatePaymentMethodRequest, 'business_uuid'>>(initialFormData);
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

    const loadPaymentMethodForEdit = (paymentMethod: PaymentMethod) => {
        setFormData({
            name: paymentMethod.name,
        });
    };

    return {
        formData,
        formErrors,
        setFormData,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadPaymentMethodForEdit,
    };
}