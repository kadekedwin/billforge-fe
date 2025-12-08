"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaymentMethods } from "@/lib/api/payment-methods";
import type { PaymentMethod, Business } from "@/lib/api";

interface UsePaymentMethodsDataResult {
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    error: string | null;
    setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    loadData: () => Promise<void>;
}

export function usePaymentMethodsData(selectedBusiness: Business | null): UsePaymentMethodsDataResult {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const paymentMethodsResponse = await getPaymentMethods();

            if (paymentMethodsResponse.success) {
                const filteredPaymentMethods = paymentMethodsResponse.data.filter(
                    (pm) => pm.business_uuid === selectedBusiness.uuid
                );
                setPaymentMethods(filteredPaymentMethods);
            } else {
                const errorData = paymentMethodsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load payment methods");
            }
        } catch (err) {
            setError("An error occurred while loading data");
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        paymentMethods,
        isLoading,
        error,
        setPaymentMethods,
        setError,
        loadData,
    };
}