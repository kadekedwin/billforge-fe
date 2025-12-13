"use client";

import { useState, useEffect, useCallback } from "react";
import { getItemDiscounts } from "@/lib/api/item-discounts";
import type { ItemDiscount, Business } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface UseItemDiscountsDataResult {
    discounts: ItemDiscount[];
    isLoading: boolean;
    error: string | null;
    setDiscounts: React.Dispatch<React.SetStateAction<ItemDiscount[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    loadData: () => Promise<void>;
}

export function useItemDiscountsData(selectedBusiness: Business | null): UseItemDiscountsDataResult {
    const { t } = useTranslation();
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
                setError(errorData.message || t('app.itemDiscounts.discountsLoadError'));
            }
        } catch (err) {
            setError(t('app.itemDiscounts.loadingError'));
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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