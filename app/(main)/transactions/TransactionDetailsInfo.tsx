"use client";

import type { Transaction } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{t('app.transactions.customer')}</p>
                <p className="text-sm">{getCustomerName(transaction.customer_uuid)}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{t('app.transactions.paymentMethod')}</p>
                <p className="text-sm">{getPaymentMethodName(transaction.payment_method_uuid)}</p>
            </div>
            <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">{t('app.transactions.date')}</p>
                <p className="text-sm">{new Date(transaction.created_at).toLocaleString()}</p>
            </div>
            <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">{t('app.transactions.transactionId')}</p>
                <p className="text-sm font-mono">{transaction.uuid}</p>
            </div>
            {transaction.notes && (
                <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">{t('app.transactions.notes')}</p>
                    <p className="text-sm whitespace-pre-wrap">{transaction.notes}</p>
                </div>
            )}
        </div>
    );
}