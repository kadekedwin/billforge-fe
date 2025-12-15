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
import { useReceiptGenerator } from "@/lib/receipt/useReceiptGenerator";
import { useReceiptTemplatePreference } from "@/lib/receipt";
import { useBusiness } from "@/contexts/business-context";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { ReceiptData } from "@/lib/receipt/types";
import { generateReceiptHTML } from "@/lib/receipt/templates";
import { printThermalReceipt } from "@/lib/receipt/printClient";
import { toast } from "sonner";

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
    const { generatePDF, generateImage, loading: receiptLoading } = useReceiptGenerator();
    const { selectedBusiness } = useBusiness();
    const { template: receiptTemplate } = useReceiptTemplatePreference({ businessUuid: selectedBusiness?.uuid || null });

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

    const handleThermalPrint = async () => {
        try {
            setIsPrinting(true);
            const result = await printThermalReceipt(receiptData);
            if (result.success) {
                toast.success(t('app.settings.receiptPopup.receiptPrintedSuccess'));
            } else {
                toast.error(result.message || t('app.settings.receiptPopup.receiptPrintedFailed'));
            }
        } catch (err) {
            console.error("Error printing receipt:", err);
            toast.error(t('app.settings.receiptPopup.receiptPrintedFailed'));
        } finally {
            setIsPrinting(false);
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
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownloadPDF}
                                disabled={receiptLoading}
                                className="flex-1"
                                variant="default"
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

                        <Button
                            onClick={handleThermalPrint}
                            disabled={isPrinting}
                            className="w-full"
                            variant="secondary"
                        >
                            {isPrinting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Printer className="mr-2 h-4 w-4" />
                            )}
                            {t('app.settings.receiptPopup.printThermal')}
                        </Button>

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

