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
import { Download, Mail, MessageCircle, Loader2 } from "lucide-react";
import { useReceiptGenerator } from "@/lib/receipt/useReceiptGenerator";
import { useReceiptTemplatePreference } from "@/lib/receipt";
import { useBusiness } from "@/contexts/business-context";
import type { ReceiptData } from "@/lib/receipt/types";
import { generateReceiptHTML } from "@/lib/receipt/templates";

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
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
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
            alert("Failed to download receipt");
        }
    };

    const handleDownloadImage = async () => {
        try {
            await generateImage(receiptData, { type: 'png' }, receiptTemplate);
        } catch (err) {
            console.error("Error downloading image:", err);
            alert("Failed to download receipt image");
        }
    };

    const handleSendEmail = async () => {
        if (!customerEmail) return;

        try {
            setIsSendingEmail(true);
            console.log("Send receipt to email:", customerEmail);
            alert(`Receipt will be sent to ${customerEmail}`);
        } catch (err) {
            console.error("Error sending email:", err);
            alert("Failed to send email");
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
            alert("Failed to send WhatsApp message");
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Transaction Complete!</DialogTitle>
                    <DialogDescription>
                        Your transaction has been successfully completed. Download or send the receipt.
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
                                Download PDF
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
                                Download Image
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
                                        Send to Email
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
                                        Send to WhatsApp
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

