"use client";

import { useState, useEffect } from "react";
import { getTransactionItems } from "@/lib/api/transaction-items";
import { getImageUrl } from "@/lib/images/operations";
import { useBusiness } from "@/contexts/business-context";
import { useReceiptGenerator } from "@/lib/receipt-generator/useReceiptGenerator";
import { useReceiptTemplatePreference } from "@/lib/receipt-settings";
import { usePrinterSettings } from "@/lib/printer-settings";
import { useReceiptPrint, PrintClientWebSocket } from "@/lib/print-client";
import { convertTransactionToReceiptData } from "@/lib/receipt-generator/utils";
import { getCurrencySymbol } from "@/lib/utils/currency";
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
    const { includeLogo, footerMessage, qrcodeValue, receiptStyle,
        printerFont, lineCharacter, itemLayout,
        labelReceiptId, labelReceiptIdEnabled,
        labelTransactionId, labelTransactionIdEnabled,
        labelDate, labelDateEnabled,
        labelTime, labelTimeEnabled,
        labelCashier, labelCashierEnabled,
        labelCustomer, labelCustomerEnabled,
        labelItems, labelItemsEnabled,
        labelSubtotal, labelSubtotalEnabled,
        labelDiscount, labelDiscountEnabled,
        labelTax, labelTaxEnabled,
        labelTotal, labelTotalEnabled,
        labelPaymentMethod, labelPaymentMethodEnabled,
        labelAmountPaid, labelAmountPaidEnabled,
        labelChange, labelChangeEnabled,
        transactionPrefix, transactionNextNumber
    } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });
    const { transactions, customers, paymentMethods, isLoading, error } = useTransactionsData(selectedBusiness);
    const { generatePDF, generateImage, loading: receiptLoading } = useReceiptGenerator();

    const [isPrinting, setIsPrinting] = useState(false);
    const [printClient, setPrintClient] = useState<PrintClientWebSocket | null>(null);

    const {
        paperWidthMm,
        charsPerLine,
        encoding,
        feedLines,
        cutEnabled
    } = usePrinterSettings({ businessUuid: selectedBusiness?.uuid || null });
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
                    updatedAt: selectedBusiness.updated_at,
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
                : undefined;

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
                {
                    id: 0,
                    uuid: '',
                    business_uuid: selectedBusiness.uuid,
                    receipt_style_id: Number(receiptStyle === 'classic' ? 0 : 1),
                    include_image: includeLogo,
                    footer_message: footerMessage || null,
                    qrcode_data: qrcodeValue || null,
                    transaction_prefix: transactionPrefix || null,
                    transaction_next_number: transactionNextNumber,
                    line_character: lineCharacter || null,
                    item_layout: itemLayout,
                    label_receipt_id: labelReceiptId || null,
                    label_receipt_id_enabled: labelReceiptIdEnabled,
                    label_transaction_id: labelTransactionId || null,
                    label_transaction_id_enabled: labelTransactionIdEnabled,
                    label_date: labelDate || null,
                    label_date_enabled: labelDateEnabled,
                    label_time: labelTime || null,
                    label_time_enabled: labelTimeEnabled,
                    label_cashier: labelCashier || null,
                    label_cashier_enabled: labelCashierEnabled,
                    label_customer: labelCustomer || null,
                    label_customer_enabled: labelCustomerEnabled,
                    label_items: labelItems || null,
                    label_items_enabled: labelItemsEnabled,
                    label_subtotal: labelSubtotal || null,
                    label_subtotal_enabled: labelSubtotalEnabled,
                    label_discount: labelDiscount || null,
                    label_discount_enabled: labelDiscountEnabled,
                    label_tax: labelTax || null,
                    label_tax_enabled: labelTaxEnabled,
                    label_total: labelTotal || null,
                    label_total_enabled: labelTotalEnabled,
                    label_payment_method: labelPaymentMethod || null,
                    label_payment_method_enabled: labelPaymentMethodEnabled,
                    label_amount_paid: labelAmountPaid || null,
                    label_amount_paid_enabled: labelAmountPaidEnabled,
                    label_change: labelChange || null,
                    label_change_enabled: labelChangeEnabled,
                    created_at: '',
                    updated_at: ''
                }
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
                : undefined;

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
                {
                    id: 0,
                    uuid: '',
                    business_uuid: selectedBusiness.uuid,
                    receipt_style_id: Number(receiptStyle === 'classic' ? 0 : 1),
                    include_image: includeLogo,
                    footer_message: footerMessage || null,
                    qrcode_data: qrcodeValue || null,
                    transaction_prefix: transactionPrefix || null,
                    transaction_next_number: transactionNextNumber,
                    line_character: lineCharacter || null,
                    item_layout: itemLayout,
                    label_receipt_id: labelReceiptId || null,
                    label_receipt_id_enabled: labelReceiptIdEnabled,
                    label_transaction_id: labelTransactionId || null,
                    label_transaction_id_enabled: labelTransactionIdEnabled,
                    label_date: labelDate || null,
                    label_date_enabled: labelDateEnabled,
                    label_time: labelTime || null,
                    label_time_enabled: labelTimeEnabled,
                    label_cashier: labelCashier || null,
                    label_cashier_enabled: labelCashierEnabled,
                    label_customer: labelCustomer || null,
                    label_customer_enabled: labelCustomerEnabled,
                    label_items: labelItems || null,
                    label_items_enabled: labelItemsEnabled,
                    label_subtotal: labelSubtotal || null,
                    label_subtotal_enabled: labelSubtotalEnabled,
                    label_discount: labelDiscount || null,
                    label_discount_enabled: labelDiscountEnabled,
                    label_tax: labelTax || null,
                    label_tax_enabled: labelTaxEnabled,
                    label_total: labelTotal || null,
                    label_total_enabled: labelTotalEnabled,
                    label_payment_method: labelPaymentMethod || null,
                    label_payment_method_enabled: labelPaymentMethodEnabled,
                    label_amount_paid: labelAmountPaid || null,
                    label_amount_paid_enabled: labelAmountPaidEnabled,
                    label_change: labelChange || null,
                    label_change_enabled: labelChangeEnabled,
                    created_at: '',
                    updated_at: ''
                }
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

            const customer = getCustomer(selectedTransaction.customer_uuid, customers);
            const paymentMethodName = selectedTransaction.payment_method_uuid
                ? getPaymentMethodName(selectedTransaction.payment_method_uuid, paymentMethods)
                : undefined;

            const receiptData = convertTransactionToReceiptData(
                selectedTransaction,
                transactionItems,
                selectedBusiness,
                customer?.name,
                paymentMethodName,
                footerMessage || undefined,
                businessLogoUrl,
                qrcodeValue || undefined,
                getCurrencySymbol(selectedBusiness.currency)
            );

            const connectedDevices = await printClient.getConnectedDevices();
            if (connectedDevices.devices.length === 0) {
                toast.error(t('app.settings.printer.noPrinterConnected'));
                setIsPrinting(false);
                return;
            }

            const printerId = connectedDevices.devices[0].id;

            await printReceipt(receiptData, {
                printerId,
                printerSettings: {
                    paperWidthMm,
                    charsPerLine,
                    encoding,
                    feedLines,
                    cutEnabled
                },
                receiptSettings: {
                    id: 0,
                    uuid: '',
                    business_uuid: selectedBusiness.uuid,
                    receipt_style_id: 0,
                    include_image: includeLogo,
                    footer_message: footerMessage || null,
                    qrcode_data: qrcodeValue || null,
                    transaction_prefix: transactionPrefix || null,
                    transaction_next_number: transactionNextNumber,
                    line_character: lineCharacter || null,
                    item_layout: itemLayout,
                    label_receipt_id: labelReceiptId || null,
                    label_receipt_id_enabled: labelReceiptIdEnabled,
                    label_transaction_id: labelTransactionId || null,
                    label_transaction_id_enabled: labelTransactionIdEnabled,
                    label_date: labelDate || null,
                    label_date_enabled: labelDateEnabled,
                    label_time: labelTime || null,
                    label_time_enabled: labelTimeEnabled,
                    label_cashier: labelCashier || null,
                    label_cashier_enabled: labelCashierEnabled,
                    label_customer: labelCustomer || null,
                    label_customer_enabled: labelCustomerEnabled,
                    label_items: labelItems || null,
                    label_items_enabled: labelItemsEnabled,
                    label_subtotal: labelSubtotal || null,
                    label_subtotal_enabled: labelSubtotalEnabled,
                    label_discount: labelDiscount || null,
                    label_discount_enabled: labelDiscountEnabled,
                    label_tax: labelTax || null,
                    label_tax_enabled: labelTaxEnabled,
                    label_total: labelTotal || null,
                    label_total_enabled: labelTotalEnabled,
                    label_payment_method: labelPaymentMethod || null,
                    label_payment_method_enabled: labelPaymentMethodEnabled,
                    label_amount_paid: labelAmountPaid || null,
                    label_amount_paid_enabled: labelAmountPaidEnabled,
                    label_change: labelChange || null,
                    label_change_enabled: labelChangeEnabled,
                    created_at: '',
                    updated_at: ''
                }
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