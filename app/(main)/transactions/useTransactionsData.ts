"use client";

import { useState, useEffect, useCallback } from "react";
import { getTransactions } from "@/lib/api/transactions";
import { getCustomers } from "@/lib/api/customers";
import { getPaymentMethods } from "@/lib/api/payment-methods";
import type { Transaction, Customer, PaymentMethod, Business } from "@/lib/api";

interface UseTransactionsDataResult {
    transactions: Transaction[];
    customers: Customer[];
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    error: string | null;
    loadData: () => Promise<void>;
}

export function useTransactionsData(selectedBusiness: Business | null): UseTransactionsDataResult {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!selectedBusiness) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const [
                transactionsResponse,
                customersResponse,
                paymentMethodsResponse,
            ] = await Promise.all([
                getTransactions(),
                getCustomers(),
                getPaymentMethods(),
            ]);

            if (transactionsResponse.success) {
                setTransactions(transactionsResponse.data);
            } else {
                const errorData = transactionsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load transactions");
            }

            if (customersResponse.success) {
                setCustomers(customersResponse.data);
            }

            if (paymentMethodsResponse.success) {
                setPaymentMethods(paymentMethodsResponse.data);
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
        transactions,
        customers,
        paymentMethods,
        isLoading,
        error,
        loadData,
    };
}