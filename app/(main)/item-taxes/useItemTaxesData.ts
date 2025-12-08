"use client";

import { useState, useEffect, useCallback } from "react";
import { getItemTaxes } from "@/lib/api/item-taxes";
import type { ItemTax, Business } from "@/lib/api";

interface UseItemTaxesDataResult {
    taxes: ItemTax[];
    isLoading: boolean;
    error: string | null;
    setTaxes: React.Dispatch<React.SetStateAction<ItemTax[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    loadData: () => Promise<void>;
}

export function useItemTaxesData(selectedBusiness: Business | null): UseItemTaxesDataResult {
    const [taxes, setTaxes] = useState<ItemTax[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const taxesResponse = await getItemTaxes();

            if (taxesResponse.success) {
                const filteredTaxes = taxesResponse.data.filter(
                    (tax) => tax.business_uuid === selectedBusiness.uuid
                );
                setTaxes(filteredTaxes);
            } else {
                const errorData = taxesResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load taxes");
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
        taxes,
        isLoading,
        error,
        setTaxes,
        setError,
        loadData,
    };
}