"use client";

import { useState, useEffect, useCallback } from "react";
import { getItems } from "@/lib/api/items";
import { getItemTaxes } from "@/lib/api/item-taxes";
import { getItemDiscounts } from "@/lib/api/item-discounts";
import { getCategories } from "@/lib/api/categories";
import type { Item, ItemTax, ItemDiscount, Category, Business } from "@/lib/api";

interface UseItemsDataResult {
    items: Item[];
    taxes: ItemTax[];
    discounts: ItemDiscount[];
    categories: Category[];
    isLoading: boolean;
    error: string | null;
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useItemsData(selectedBusiness: Business | null): UseItemsDataResult {
    const [items, setItems] = useState<Item[]>([]);
    const [taxes, setTaxes] = useState<ItemTax[]>([]);
    const [discounts, setDiscounts] = useState<ItemDiscount[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const [itemsResponse, taxesResponse, discountsResponse, categoriesResponse] = await Promise.all([
                getItems(),
                getItemTaxes(),
                getItemDiscounts(),
                getCategories({ business_uuid: selectedBusiness.uuid }),
            ]);

            if (itemsResponse.success) {
                const filteredItems = itemsResponse.data.filter(
                    (item: Item) => item.business_uuid === selectedBusiness.uuid
                );
                setItems(filteredItems);
            } else {
                const errorData = itemsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load items");
            }

            if (taxesResponse.success) {
                const filteredTaxes = taxesResponse.data.filter(
                    (tax: ItemTax) => tax.business_uuid === selectedBusiness.uuid
                );
                setTaxes(filteredTaxes);
            }

            if (discountsResponse.success) {
                const filteredDiscounts = discountsResponse.data.filter(
                    (discount: ItemDiscount) => discount.business_uuid === selectedBusiness.uuid
                );
                setDiscounts(filteredDiscounts);
            }

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data);
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
        items,
        taxes,
        discounts,
        categories,
        isLoading,
        error,
        setItems,
        setError,
    };
}