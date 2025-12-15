"use client";

import { useState, useEffect } from "react";
import { getTransactionItems } from "@/lib/api/transaction-items";
import { getImageUrl } from "@/lib/images/operations";
import { useBusiness } from "@/contexts/business-context";
import { useReceiptGenerator } from "@/lib/receipt/useReceiptGenerator";
import { useReceiptTemplatePreference } from "@/lib/receipt";
import type { Transaction, TransactionItem } from "@/lib/api";
import { TransactionsTable } from "./TransactionsTable";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { useTransactionsData } from "./useTransactionsData";
import { getCustomerName, getPaymentMethodName, getCustomer } from "./transactionsUtils";
import {
    handleDownloadPDF,
    handleDownloadImage,
    handleSendEmail,
    handleSendWhatsApp,
    handlePrintThermal,
} from "./receiptHandlers";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toast } from "sonner";

export default function TransactionsPage() {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const { includeLogo, footerMessage, qrcodeValue, template: receiptTemplate } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });
    const { transactions, customers, paymentMethods, isLoading, error } = useTransactionsData(selectedBusiness);
    const { generatePDF, generateImage, loading: receiptLoading } = useReceiptGenerator();

    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>(undefined);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        const fetchBusinessLogo = async () => {
            if (selectedBusiness && includeLogo && selectedBusiness.image_size_bytes) {
                const result = await getImageUrl({
                    folder: 'businesses',
                    uuid: selectedBusiness.uuid,
                });
                if (result.success && result.url) {
                    setBusinessLogoUrl(result.url);
                } else {
                    setBusinessLogoUrl(undefined);
                }
            } else {
                setBusinessLogoUrl(undefined);
            }
        };

        fetchBusinessLogo();
    }, [selectedBusiness, includeLogo]);

    const handleViewDetails = async (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailsDialogOpen(true);
        setIsLoadingItems(true);

        try {
            const response = await getTransactionItems({ transaction_uuid: transaction.uuid });
            if (response.success) {
                setTransactionItems(response.data);
            }
        } catch (err) {
            console.error("Error loading transaction items:", err);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const handlePDFDownload = async () => {
        if (!selectedTransaction || !selectedBusiness) return;

        try {
            const customer = getCustomer(selectedTransaction.customer_uuid, customers);
            const paymentMethodName = selectedTransaction.payment_method_uuid
                ? getPaymentMethodName(selectedTransaction.payment_method_uuid, paymentMethods)
                : "Cash";

            await handleDownloadPDF(
                {
                    transaction: selectedTransaction,
                    transactionItems,
                    business: selectedBusiness,
                    customer,
                    paymentMethodName,
                    footerMessage: footerMessage || undefined,
                    businessLogoUrl,
                    qrcodeValue: qrcodeValue || undefined,
                },
                generatePDF,
                receiptTemplate
            );
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleImageDownload = async () => {
        if (!selectedTransaction || !selectedBusiness) return;

        try {
            const customer = getCustomer(selectedTransaction.customer_uuid, customers);
            const paymentMethodName = selectedTransaction.payment_method_uuid
                ? getPaymentMethodName(selectedTransaction.payment_method_uuid, paymentMethods)
                : "Cash";

            await handleDownloadImage(
                {
                    transaction: selectedTransaction,
                    transactionItems,
                    business: selectedBusiness,
                    customer,
                    paymentMethodName,
                    footerMessage: footerMessage || undefined,
                    businessLogoUrl,
                    qrcodeValue: qrcodeValue || undefined,
                },
                generateImage,
                receiptTemplate
            );
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleEmailSend = async () => {
        if (!selectedTransaction) return;

        const customer = getCustomer(selectedTransaction.customer_uuid, customers);
        if (!customer?.email) return;

        try {
            setIsSendingEmail(true);
            await handleSendEmail(customer.email);
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleWhatsAppSend = async () => {
        if (!selectedTransaction) return;

        const customer = getCustomer(selectedTransaction.customer_uuid, customers);
        if (!customer?.phone) return;

        try {
            setIsSendingWhatsApp(true);
            await handleSendWhatsApp(customer.phone, selectedTransaction.uuid);
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    const handlePrint = async () => {
        if (!selectedTransaction || !selectedBusiness) return;

        try {
            setIsPrinting(true);
            const customer = getCustomer(selectedTransaction.customer_uuid, customers);
            const paymentMethodName = selectedTransaction.payment_method_uuid
                ? getPaymentMethodName(selectedTransaction.payment_method_uuid, paymentMethods)
                : "Cash";

            const result = await handlePrintThermal({
                transaction: selectedTransaction,
                transactionItems,
                business: selectedBusiness,
                customer,
                paymentMethodName,
                footerMessage: footerMessage || undefined,
                businessLogoUrl,
                qrcodeValue: qrcodeValue || undefined,
            });

            if (result.success) {
                toast.success(t('app.transactions.printSuccess'));
            } else {
                toast.error(result.message || t('app.transactions.printFailed'));
            }
        } catch (err) {
            console.error("Error printing receipt:", err);
            toast.error(t('app.transactions.printFailed'));
        } finally {
            setIsPrinting(false);
        }
    };

    const filteredTransactions = selectedBusiness
        ? transactions.filter((t) => t.business_uuid === selectedBusiness.uuid)
        : [];

    const currentCustomer = selectedTransaction
        ? getCustomer(selectedTransaction.customer_uuid, customers)
        : null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('app.transactions.title')}</h1>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <TransactionsTable
                transactions={filteredTransactions}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                getCustomerName={(uuid) => getCustomerName(uuid, customers)}
                getPaymentMethodName={(uuid) => getPaymentMethodName(uuid, paymentMethods)}
            />

            <TransactionDetailsDialog
                open={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
                transaction={selectedTransaction}
                transactionItems={transactionItems}
                isLoadingItems={isLoadingItems}
                customer={currentCustomer}
                receiptLoading={receiptLoading}
                isSendingEmail={isSendingEmail}
                isSendingWhatsApp={isSendingWhatsApp}
                isPrinting={isPrinting}
                getCustomerName={(uuid) => getCustomerName(uuid, customers)}
                getPaymentMethodName={(uuid) => getPaymentMethodName(uuid, paymentMethods)}
                onDownloadPDF={handlePDFDownload}
                onDownloadImage={handleImageDownload}
                onSendEmail={handleEmailSend}
                onSendWhatsApp={handleWhatsAppSend}
                onPrint={handlePrint}
            />
        </div>
    );
}