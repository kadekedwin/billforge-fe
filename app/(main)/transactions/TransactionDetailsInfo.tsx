"use client";

import type { Transaction } from "@/lib/api";

interface TransactionDetailsInfoProps {
    transaction: Transaction;
    getCustomerName: (customerUuid: string | null) => string;
    getPaymentMethodName: (paymentMethodUuid: string | null) => string;
}

export function TransactionDetailsInfo({
                                           transaction,
                                           getCustomerName,
                                           getPaymentMethodName,
                                       }: TransactionDetailsInfoProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="text-sm">{getCustomerName(transaction.customer_uuid)}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-sm">{getPaymentMethodName(transaction.payment_method_uuid)}</p>
            </div>
            <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm">{new Date(transaction.created_at).toLocaleString()}</p>
            </div>
            <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                <p className="text-sm font-mono">{transaction.uuid}</p>
            </div>
            {transaction.notes && (
                <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{transaction.notes}</p>
                </div>
            )}
        </div>
    );
}