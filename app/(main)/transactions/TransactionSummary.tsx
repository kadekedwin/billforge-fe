"use client";

import type { Transaction } from "@/lib/api";
import { useBusiness } from "@/contexts/business-context";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface TransactionSummaryProps {
    transaction: Transaction;
}

export function TransactionSummary({ transaction }: TransactionSummaryProps) {
    const { selectedBusiness } = useBusiness();
    const currencySymbol = getCurrencySymbol(selectedBusiness?.currency);

    return (
        <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
                <span className="text-sm">Total Amount:</span>
                <span className="text-sm font-medium">
                    {currencySymbol}{parseFloat(transaction.total_amount).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm">Tax Amount:</span>
                <span className="text-sm font-medium">
                    {currencySymbol}{parseFloat(transaction.tax_amount).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm">Discount Amount:</span>
                <span className="text-sm font-medium text-green-600">
                    -{currencySymbol}{parseFloat(transaction.discount_amount).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Final Amount:</span>
                <span className="font-semibold text-lg">
                    {currencySymbol}{parseFloat(transaction.final_amount).toFixed(2)}
                </span>
            </div>
        </div>
    );
}