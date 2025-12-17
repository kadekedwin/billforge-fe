"use client";

import { useState, useEffect } from "react";
import { getTransactionItems } from "@/lib/api/transaction-items";
import { getImageUrl } from "@/lib/images/operations";
import { useBusiness } from "@/contexts/business-context";
import { useReceiptGenerator, generateReceiptHTML } from "@/lib/receipt-generator";
import { useReceiptTemplatePreference } from "@/lib/receipt-settings";
import { usePrinterSettings } from "@/lib/printer-settings";
import { useReceiptPrint, PrintClientWebSocket } from "@/lib/print-client";
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
} from "./receiptHandlers";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { toast } from "sonner";

export default function TransactionsPage() {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const { includeLogo, footerMessage, qrcodeValue, imageTemplate: receiptTemplate, printTemplate } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });
    const { transactions, customers, paymentMethods, isLoading, error } = useTransactionsData(selectedBusiness);
    const { generatePDF, generateImage, loading: receiptLoading } = useReceiptGenerator();

    const [isPrinting, setIsPrinting] = useState(false);
    const [printClient, setPrintClient] = useState<PrintClientWebSocket | null>(null);

    const { } = usePrinterSettings({ businessUuid: selectedBusiness?.uuid || null });
    const { printReceipt } = useReceiptPrint({ printClient });

    useEffect(() => {
        const client = new PrintClientWebSocket();
        client.connect().catch(err => {
            console.error("Failed to connect to print client. Ensure the BillForge Print Client is running on port 42123.", err);
        });
        setPrintClient(client);

        return () => {
            client.disconnect();
        }
    }, []);

    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>(undefined);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);


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

    const handlePrintReceipt = async () => {
        if (!selectedTransaction || !selectedBusiness) return;

        if (!printClient || !printClient.isConnected()) {
            toast.error(t('app.settings.printer.noPrinterConnected'));
            return;
        }

        try {
            setIsPrinting(true);

            // Reconstruct receipt data structure locally as handleDownloadPDF/Image helper does
            // Note: Ideally extract this data construction to a shared utility
            const customer = getCustomer(selectedTransaction.customer_uuid, customers);
            const paymentMethodName = selectedTransaction.payment_method_uuid
                ? getPaymentMethodName(selectedTransaction.payment_method_uuid, paymentMethods)
                : "Cash";

            // We need to map transaction items to receipt items format
            // But wait, the handler helpers use a constructor function.
            // Let's manually construct the ReceiptData object here to pass to printReceipt
            // Or better, reuse the logic if possible.
            // The helpers in receiptHandlers don't return the data object, they execute the action.
            // I will construct it here manually for now, similar to how receipt-popup or helpers do it.

            // Since we need to be quick and consistent, let's look at `receiptHandlers.ts` or `transactionsUtils.ts` if there is a mapper.
            // There isn't an exposed mapper in imports.
            // I'll do basic mapping here.

            const receiptData = {
                receiptNumber: selectedTransaction.transaction_id || selectedTransaction.id.toString(),
                date: new Date(selectedTransaction.created_at).toLocaleDateString(),
                time: new Date(selectedTransaction.created_at).toLocaleTimeString(),
                items: transactionItems.map(item => ({
                    id: item.uuid,
                    name: item.name,
                    quantity: item.quantity,
                    price: parseFloat(item.base_price),
                    total: parseFloat(item.total_price)
                })),
                subtotal: parseFloat(selectedTransaction.total_amount),
                tax: parseFloat(selectedTransaction.tax_amount),
                discount: parseFloat(selectedTransaction.discount_amount),
                total: parseFloat(selectedTransaction.final_amount),
                paymentMethod: paymentMethodName,
                cashierName: "Admin",
                customerName: customer ? customer.name : "Guest",
                storeName: selectedBusiness.name,
                storeAddress: selectedBusiness.address || "",
                storePhone: selectedBusiness.phone || "",
                currencySymbol: selectedBusiness.currency || "$",
                footer: footerMessage || undefined,
                qrcode: qrcodeValue || undefined,
                storeLogo: businessLogoUrl,
            };


            const PRINT_TEMPLATE_TYPE_MAP: Record<string, number> = {
                'thermal-classic': 0,
                'thermal-compact': 1,
                'thermal-detailed': 2,
            };
            const templateId = PRINT_TEMPLATE_TYPE_MAP[printTemplate] ?? 0;

            const connectedDevices = await printClient.getConnectedDevices();
            if (connectedDevices.devices.length === 0) {
                toast.error(t('app.settings.printer.noPrinterConnected'));
                setIsPrinting(false);
                return;
            }

            const printerId = connectedDevices.devices[0].id; // Use first available

            await printReceipt(receiptData, {
                printerId,
                templateId,
            });
            toast.success(t('app.settings.printer.printSuccess'));

        } catch (err) {
            console.error("Error printing receipt:", err);
            toast.error(t('app.settings.printer.printFailed'));
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
                isPrinting={isPrinting}
                isSendingEmail={isSendingEmail}
                isSendingWhatsApp={isSendingWhatsApp}

                getCustomerName={(uuid) => getCustomerName(uuid, customers)}
                getPaymentMethodName={(uuid) => getPaymentMethodName(uuid, paymentMethods)}
                onDownloadPDF={handlePDFDownload}
                onDownloadImage={handleImageDownload}
                onPrint={handlePrintReceipt}
                onSendEmail={handleEmailSend}
                onSendWhatsApp={handleWhatsAppSend}

            />
        </div>
    );
}