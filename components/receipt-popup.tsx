"use client";

import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, MessageCircle, Loader2, Printer } from "lucide-react";
import { useReceiptGenerator } from "@/lib/receipt-generator";
import { useReceiptTemplatePreference } from "@/lib/receipt-settings";
import { useBusiness } from "@/contexts/business-context";
import { usePrinterSettings } from "@/lib/printer-settings";
import { useReceiptPrint, PrintClientWebSocket } from "@/lib/print-client";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { ReceiptData } from "@/lib/receipt-generator";
import { generateReceiptHTML } from "@/lib/receipt-generator";

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

    const { } = usePrinterSettings({ businessUuid: selectedBusiness?.uuid || null }); // Removed printClient
    const { printReceipt } = useReceiptPrint({ printClient });
    const {
        imageTemplate: receiptTemplate,
        printTemplate
    } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });

    useEffect(() => {
        if (open) {
            const client = new PrintClientWebSocket();
            client.connect().catch(err => {
                console.error("Failed to connect to print client. Ensure the BillForge Print Client is running on port 42123.", err);
            });
            setPrintClient(client);

            return () => {
                client.disconnect();
            }
        }
    }, [open]);

    const templateHTML = generateReceiptHTML(receiptData, receiptTemplate);

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

    const handlePrintReceipt = async () => {
        if (!printClient || !printClient.isConnected()) {
            import('sonner').then(({ toast }) => {
                toast.error(t('app.settings.printer.noPrinterConnected'));
            });
            return;
        }

        try {
            setIsPrinting(true);
            // Get print template ID - need to map the type string to ID if needed or updated hook
            // The updated hook returns printTemplate type (e.g. 'thermal-classic')
            // useReceiptPrint expects templateId number (0, 1, 2)
            // I need a mapper here or update useReceiptPrint to accept string type

            const PRINT_TEMPLATE_TYPE_MAP: Record<string, number> = {
                'thermal-classic': 0,
                'thermal-compact': 1,
                'thermal-detailed': 2,
            };

            const templateId = PRINT_TEMPLATE_TYPE_MAP[printTemplate] ?? 0;

            // Printer ID logic: currently useReceiptPrint needs printerId
            // The user request says "print to the thermal printer bluetooth"
            // I should get the connected printer ID from settings or discover it?
            // Usually we might print to the *active* printer.
            // Let's assume we print to the first connected device or managed printer

            const connectedDevices = await printClient.getConnectedDevices();
            if (connectedDevices.devices.length === 0) {
                import('sonner').then(({ toast }) => {
                    toast.error(t('app.settings.printer.noPrinterConnected'));
                });
                setIsPrinting(false);
                return;
            }

            // For now, pick the first one
            const printerId = connectedDevices.devices[0].id;

            await printReceipt(receiptData, {
                printerId,
                templateId,
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
    };

    const handleDownloadPDF = async () => {
        try {
            await generatePDF(receiptData, undefined, receiptTemplate);
        } catch (err) {
            console.error("Error downloading PDF:", err);
            alert(t('app.settings.receiptPopup.failedDownload'));
        }
    };

    const handleDownloadImage = async () => {
        try {
            await generateImage(receiptData, { type: 'png' }, receiptTemplate);
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

