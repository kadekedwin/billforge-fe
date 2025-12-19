"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, MessageCircle, Loader2, Printer } from "lucide-react";
import { useReceiptGenerator } from "@/lib/receipt-generator/useReceiptGenerator";
import { useReceiptTemplatePreference } from "@/lib/receipt-settings";
import { useBusiness } from "@/contexts/business-context";
import { usePrinterSettings } from "@/lib/printer-settings";
import { useReceiptPrint, PrintClientWebSocket } from "@/lib/print-client";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ReceiptData } from "@/lib/receipt-generator/types";
import { generateDynamicReceiptHTML } from "@/lib/receipt-generator/dynamic-preview";

interface ReceiptPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receiptData: ReceiptData;
    customerEmail?: string | null;
    customerPhone?: string | null;
}

export function ReceiptPopup({
    open,
    onOpenChange,
    receiptData,
    customerEmail,
    customerPhone,
}: ReceiptPopupProps) {
    const { t } = useTranslation();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [printClient, setPrintClient] = useState<PrintClientWebSocket | null>(null);

    const { generatePDF, generateImage, loading: receiptLoading } = useReceiptGenerator();
    const { selectedBusiness } = useBusiness();

    const {
        paperWidthMm,
        charsPerLine,
        encoding,
        feedLines,
        cutEnabled,
        autoPrint
    } = usePrinterSettings({ businessUuid: selectedBusiness?.uuid || null });
    const { printReceipt } = useReceiptPrint({ printClient });
    const {
        includeLogo, footerMessage, qrcodeValue, receiptStyle,
        transactionPrefix, transactionNextNumber,
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
        refetch: refetchSettings
    } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });

    const hasAutoPrintedRef = useRef(false);

    useEffect(() => {
        if (open) {
            const client = new PrintClientWebSocket();
            client.connect().catch(err => {
                console.error("Failed to connect to print client. Ensure the BillForge Print Client is running on port 42123.", err);
            });
            setPrintClient(client);
            hasAutoPrintedRef.current = false;

            return () => {
                client.disconnect();
            }
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            refetchSettings();
        }
    }, [open, refetchSettings]);

    const [templateHTML, setTemplateHTML] = useState<string>('');

    useEffect(() => {
        if (!open) return;

        let isMounted = true;
        const generateHtml = async () => {
            try {
                const html = await generateDynamicReceiptHTML(receiptData, {
                    id: 0,
                    uuid: '',
                    business_uuid: selectedBusiness?.uuid || '',
                    receipt_style_id: Number(receiptStyle === 'classic' ? 0 : 1),
                    include_image: includeLogo,
                    footer_message: footerMessage || null,
                    qrcode_data: qrcodeValue || null,
                    transaction_prefix: transactionPrefix || null,
                    transaction_next_number: transactionNextNumber,
                    line_character: lineCharacter || '-',
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
                });
                if (isMounted) {
                    setTemplateHTML(html);
                }
            } catch (err) {
                console.error("Error generating receipt HTML:", err);
            }
        };

        generateHtml();

        return () => {
            isMounted = false;
        };
    }, [
        open,
        receiptData,
        selectedBusiness,
        receiptStyle,
        includeLogo,
        footerMessage,
        qrcodeValue,
        transactionPrefix,
        transactionNextNumber,
        lineCharacter,
        itemLayout,
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
        labelChange, labelChangeEnabled
    ]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !open) return;

        const adjustHeight = () => {
            try {
                const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDocument) {
                    const height = iframeDocument.documentElement.scrollHeight;
                    iframe.style.height = `${Math.max(height, 400)}px`;
                }
            } catch (error) {
                console.error('Error adjusting iframe height:', error);
            }
        };

        iframe.addEventListener('load', adjustHeight);
        const timer = setTimeout(adjustHeight, 500);

        return () => {
            iframe.removeEventListener('load', adjustHeight);
            clearTimeout(timer);
        };
    }, [open, receiptData]);

    const handlePrintReceipt = useCallback(async () => {
        if (!printClient || !printClient.isConnected()) {
            import('sonner').then(({ toast }) => {
                toast.error(t('app.settings.printer.noPrinterConnected'));
            });
            return;
        }

        if (!selectedBusiness) {
            return;
        }


        try {
            setIsPrinting(true);

            const connectedDevices = await printClient.getConnectedDevices();
            if (connectedDevices.devices.length === 0) {
                import('sonner').then(({ toast }) => {
                    toast.error(t('app.settings.printer.noPrinterConnected'));
                });
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

            import('sonner').then(({ toast }) => {
                toast.success(t('app.settings.printer.printSuccess'));
            });

        } catch (err) {
            console.error("Error printing receipt:", err);
            import('sonner').then(({ toast }) => {
                toast.error(t('app.settings.printer.printFailed'));
            });
        } finally {
            setIsPrinting(false);
        }
    }, [printClient, printReceipt, receiptData, paperWidthMm, charsPerLine, encoding, feedLines, cutEnabled, t, includeLogo, footerMessage, qrcodeValue, transactionPrefix, transactionNextNumber, lineCharacter, itemLayout, labelReceiptId, labelReceiptIdEnabled, labelTransactionId, labelTransactionIdEnabled, labelDate, labelDateEnabled, labelTime, labelTimeEnabled, labelCashier, labelCashierEnabled, labelCustomer, labelCustomerEnabled, labelItems, labelItemsEnabled, labelSubtotal, labelSubtotalEnabled, labelDiscount, labelDiscountEnabled, labelTax, labelTaxEnabled, labelTotal, labelTotalEnabled, labelPaymentMethod, labelPaymentMethodEnabled, labelAmountPaid, labelAmountPaidEnabled, labelChange, labelChangeEnabled, selectedBusiness]);

    // Auto-print effect
    useEffect(() => {
        if (open && autoPrint && printClient && !hasAutoPrintedRef.current) {
            // Small delay to ensure print client is ready and settings are loaded
            const timer = setTimeout(() => {
                hasAutoPrintedRef.current = true;
                handlePrintReceipt();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [open, autoPrint, printClient, handlePrintReceipt]);

    const handleDownloadPDF = async () => {
        try {
            await generatePDF(receiptData, {
                settings: {
                    id: 0,
                    uuid: '',
                    business_uuid: selectedBusiness?.uuid || '',
                    receipt_style_id: Number(receiptStyle === 'classic' ? 0 : 1),
                    include_image: includeLogo,
                    footer_message: footerMessage || null,
                    qrcode_data: qrcodeValue || null,
                    transaction_prefix: transactionPrefix || null,
                    transaction_next_number: transactionNextNumber,
                    line_character: lineCharacter,
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
        } catch (err) {
            console.error("Error downloading PDF:", err);
            alert(t('app.settings.receiptPopup.failedDownload'));
        }
    };

    const handleDownloadImage = async () => {
        try {
            await generateImage(receiptData, {
                type: 'png',
                settings: {
                    id: 0,
                    uuid: '',
                    business_uuid: selectedBusiness?.uuid || '',
                    receipt_style_id: Number(receiptStyle === 'classic' ? 0 : 1),
                    include_image: includeLogo,
                    footer_message: footerMessage || null,
                    qrcode_data: qrcodeValue || null,
                    transaction_prefix: transactionPrefix || null,
                    transaction_next_number: transactionNextNumber,
                    line_character: lineCharacter,
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
        } catch (err) {
            console.error("Error downloading image:", err);
            alert(t('app.settings.receiptPopup.failedDownloadImage'));
        }
    };

    const handleSendEmail = async () => {
        if (!customerEmail) return;

        try {
            setIsSendingEmail(true);
            console.log("Send receipt to email:", customerEmail);
            alert(`${t('app.settings.receiptPopup.receiptWillBeSent')} ${customerEmail}`);
        } catch (err) {
            console.error("Error sending email:", err);
            alert(t('app.settings.receiptPopup.failedSendEmail'));
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!customerPhone) return;

        try {
            setIsSendingWhatsApp(true);
            const message = encodeURIComponent(`Receipt #${receiptData.receiptNumber}`);
            const phoneNumber = customerPhone.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        } catch (err) {
            console.error("Error sending WhatsApp:", err);
            alert(t('app.settings.receiptPopup.failedSendWhatsApp'));
        } finally {
            setIsSendingWhatsApp(false);
        }
    };



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('app.settings.receiptPopup.title')}</DialogTitle>
                    <DialogDescription>
                        {t('app.settings.receiptPopup.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative bg-muted/50 rounded-lg shadow-sm border border-gray-200 flex justify-center items-start">
                        <iframe
                            key={receiptData.receiptNumber}
                            ref={iframeRef}
                            srcDoc={templateHTML}
                            className="border-0 w-full"
                            style={{
                                maxWidth: '302px',
                                minHeight: '400px'
                            }}
                            title="Receipt Preview"
                            sandbox="allow-same-origin allow-scripts"
                        />
                    </div>

                    <div className="space-y-2">
                        <Button
                            onClick={handlePrintReceipt}
                            disabled={isPrinting}
                            className="w-full mb-2"
                            variant="default"
                        // Using default (primary) for print as it's likely the main action
                        >
                            {isPrinting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Printer className="mr-2 h-4 w-4" />
                            )}
                            {t('app.settings.receiptPopup.printReceipt')}
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownloadPDF}
                                disabled={receiptLoading}
                                className="flex-1"
                                variant="outline"
                            >
                                {receiptLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                {t('app.settings.receiptPopup.downloadPDF')}
                            </Button>
                            <Button
                                onClick={handleDownloadImage}
                                disabled={receiptLoading}
                                className="flex-1"
                                variant="outline"
                            >
                                {receiptLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                {t('app.settings.receiptPopup.downloadImage')}
                            </Button>
                        </div>


                        {(customerEmail || customerPhone) && (
                            <div className="flex gap-2">
                                {customerEmail && (
                                    <Button
                                        onClick={handleSendEmail}
                                        disabled={isSendingEmail}
                                        className="flex-1"
                                        variant="outline"
                                    >
                                        {isSendingEmail ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Mail className="mr-2 h-4 w-4" />
                                        )}
                                        {t('app.settings.receiptPopup.sendEmail')}
                                    </Button>
                                )}
                                {customerPhone && (
                                    <Button
                                        onClick={handleSendWhatsApp}
                                        disabled={isSendingWhatsApp}
                                        className="flex-1"
                                        variant="outline"
                                    >
                                        {isSendingWhatsApp ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                        )}
                                        {t('app.settings.receiptPopup.sendWhatsApp')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

