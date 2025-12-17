"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction, TransactionItem, Customer } from "@/lib/api";
import { TransactionDetailsInfo } from "./TransactionDetailsInfo";
import { TransactionItemsTable } from "./TransactionItemsTable";
import { TransactionSummary } from "./TransactionSummary";
import { ReceiptActions } from "./ReceiptActions";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface TransactionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: Transaction | null;
    transactionItems: TransactionItem[];
    isLoadingItems: boolean;
    customer: Customer | null;
    receiptLoading: boolean;
    isPrinting?: boolean; // Optional to stay compatible if page doesn't pass it yet, but we will pass it
    isSendingEmail: boolean;
    isSendingWhatsApp: boolean;

    getCustomerName: (customerUuid: string | null) => string;
    getPaymentMethodName: (paymentMethodUuid: string | null) => string;
    onPrint?: () => void; // Optional for now
    onDownloadPDF: () => void;
    onDownloadImage: () => void;
    onSendEmail: () => void;
    onSendWhatsApp: () => void;

}

export function TransactionDetailsDialog({
    open,
    onOpenChange,
    transaction,
    transactionItems,
    isLoadingItems,
    customer,
    receiptLoading,
    isPrinting = false,
    isSendingEmail,
    isSendingWhatsApp,

    getCustomerName,
    getPaymentMethodName,
    onPrint,
    onDownloadPDF,
    onDownloadImage,
    onSendEmail,
    onSendWhatsApp,

}: TransactionDetailsDialogProps) {
    const { t } = useTranslation();
    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('app.transactions.transactionDetails')}</DialogTitle>
                    <DialogDescription>
                        {t('app.transactions.viewInfo')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    <TransactionDetailsInfo
                        transaction={transaction}
                        getCustomerName={getCustomerName}
                        getPaymentMethodName={getPaymentMethodName}
                    />

                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{t('app.transactions.items')}</h3>
                        <TransactionItemsTable
                            items={transactionItems}
                            isLoading={isLoadingItems}
                        />
                    </div>

                    <TransactionSummary transaction={transaction} />

                    <ReceiptActions
                        customer={customer}
                        receiptLoading={receiptLoading}
                        isPrinting={isPrinting}
                        isSendingEmail={isSendingEmail}
                        isSendingWhatsApp={isSendingWhatsApp}

                        onPrint={onPrint || (() => { })}
                        onDownloadPDF={onDownloadPDF}
                        onDownloadImage={onDownloadImage}
                        onSendEmail={onSendEmail}
                        onSendWhatsApp={onSendWhatsApp}

                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}