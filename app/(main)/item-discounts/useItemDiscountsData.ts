"use client";

import { useState, useEffect, useCallback } from "react";
import { getItemDiscounts } from "@/lib/api/item-discounts";
import type { ItemDiscount, Business } from "@/lib/api";

interface UseItemDiscountsDataResult {
    discounts: ItemDiscount[];
    isLoading: boolean;
    error: string | null;
    setDiscounts: React.Dispatch<React.SetStateAction<ItemDiscount[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    loadData: () => Promise<void>;
}

export function useItemDiscountsData(selectedBusiness: Business | null): UseItemDiscountsDataResult {
    const [discounts, setDiscounts] = useState<ItemDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const discountsResponse = await getItemDiscounts();

            if (discountsResponse.success) {
                const filteredDiscounts = discountsResponse.data.filter(
                    (discount) => discount.business_uuid === selectedBusiness.uuid
                );
                setDiscounts(filteredDiscounts);
            } else {
                const errorData = discountsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load discounts");
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
        discounts,
        isLoading,
        error,
        setDiscounts,
        setError,
        loadData,
    };
}