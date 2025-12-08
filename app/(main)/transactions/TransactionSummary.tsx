"use client";

import type { Transaction } from "@/lib/api";

interface TransactionSummaryProps {
    transaction: Transaction;
}

export function TransactionSummary({ transaction }: TransactionSummaryProps) {
    return (
        <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between">
                <span className="text-sm">Total Amount:</span>
                <span className="text-sm font-medium">
                    ${parseFloat(transaction.total_amount).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm">Tax Amount:</span>
                <span className="text-sm font-medium">
                    ${parseFloat(transaction.tax_amount).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between">
                <span className="text-sm">Discount Amount:</span>
                <span className="text-sm font-medium text-green-600">
                    -${parseFloat(transaction.discount_amount).toFixed(2)}
                </span>
            </div>
            <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Final Amount:</span>
                <span className="font-semibold text-lg">
                    ${parseFloat(transaction.final_amount).toFixed(2)}
                </span>
            </div>
        </div>
    );
}