"use client";

import { useState, useEffect, useCallback } from "react";
import { getItems } from "@/lib/api/items";
import { getCustomers } from "@/lib/api/customers";
import { getPaymentMethods } from "@/lib/api/payment-methods";
import { getItemTaxes } from "@/lib/api/item-taxes";
import { getItemDiscounts } from "@/lib/api/item-discounts";
import { getTransactions } from "@/lib/api/transactions";
import type { Item, Customer, PaymentMethod, ItemTax, ItemDiscount, Transaction } from "@/lib/api";

interface UseDashboardDataResult {
    items: Item[];
    customers: Customer[];
    paymentMethods: PaymentMethod[];
    taxes: ItemTax[];
    discounts: ItemDiscount[];
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    loadData: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
    const [items, setItems] = useState<Item[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [taxes, setTaxes] = useState<ItemTax[]>([]);
    const [discounts, setDiscounts] = useState<ItemDiscount[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [
                itemsResponse,
                customersResponse,
                paymentMethodsResponse,
                taxesResponse,
                discountsResponse,
                transactionsResponse,
            ] = await Promise.all([
                getItems({ is_active: true }),
                getCustomers(),
                getPaymentMethods(),
                getItemTaxes(),
                getItemDiscounts(),
                getTransactions(),
            ]);

            if (itemsResponse.success) {
                setItems(itemsResponse.data);
            } else {
                const errorData = itemsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load items");
            }

            if (customersResponse.success) {
                setCustomers(customersResponse.data);
            }

            if (paymentMethodsResponse.success) {
                setPaymentMethods(paymentMethodsResponse.data);
            }

            if (taxesResponse.success) {
                setTaxes(taxesResponse.data);
            }

            if (transactionsResponse.success) {
                setTransactions(transactionsResponse.data);
            }

            if (discountsResponse.success) {
                setDiscounts(discountsResponse.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        items,
        customers,
        paymentMethods,
        taxes,
        discounts,
        transactions,
        isLoading,
        error,
        loadData,
    };
}