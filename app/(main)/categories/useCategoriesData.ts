"use client";

import { useState, useEffect, useCallback } from "react";
import { getCategories } from "@/lib/api/categories";
import type { Category, Business } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface UseCategoriesDataResult {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    loadData: () => Promise<void>;
}

export function useCategoriesData(selectedBusiness: Business | null): UseCategoriesDataResult {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const categoriesResponse = await getCategories({ business_uuid: selectedBusiness.uuid });

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data);
            } else {
                const errorData = categoriesResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || t('app.categories.categoriesLoadError'));
            }
        } catch (err) {
            setError(t('app.categories.loadingError'));
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        categories,
        isLoading,
        error,
        setCategories,
        setError,
        loadData,
    };
}
