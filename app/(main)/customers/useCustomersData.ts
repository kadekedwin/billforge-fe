"use client";

import { useState, useEffect, useCallback } from "react";
import { getCustomers } from "@/lib/api/customers";
import type { Customer, Business } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface UseCustomersDataResult {
    customers: Customer[];
    isLoading: boolean;
    error: string | null;
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    loadData: () => Promise<void>;
}

export function useCustomersData(selectedBusiness: Business | null): UseCustomersDataResult {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const customersResponse = await getCustomers();

            if (customersResponse.success) {
                const filteredCustomers = customersResponse.data.filter(
                    (customer: Customer) => customer.business_uuid === selectedBusiness.uuid
                );
                setCustomers(filteredCustomers);
            } else {
                const errorData = customersResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || t('app.customers.customersLoadError'));
            }
        } catch (err) {
            setError(t('app.customers.loadingError'));
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        customers,
        isLoading,
        error,
        setCustomers,
        setError,
        loadData,
    };
}