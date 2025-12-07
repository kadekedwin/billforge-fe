"use client";

import { useState, useEffect } from "react";
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
import type { ReceiptData } from "@/lib/receipt/types";
import Image from "next/image";

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
    const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const { generatePDF, generateImage, loading: receiptLoading } = useReceiptGenerator();
    const { template: receiptTemplate } = useReceiptTemplatePreference();

    useEffect(() => {
        if (open && receiptData) {
            generateReceiptImage();
        }

        return () => {
            if (receiptImageUrl) {
                URL.revokeObjectURL(receiptImageUrl);
            }
        };
    }, [open]);

    const generateReceiptImage = async () => {
        try {
            setIsGeneratingImage(true);

            const response = await fetch('/api/receipt/image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receiptData,
                    options: {
                        template: receiptTemplate,
                        type: 'png',
                        fullPage: true
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('[ReceiptPopup] Receipt image generation failed:', errorData);
                throw new Error(errorData.details || errorData.error || 'Failed to generate receipt image');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setReceiptImageUrl(url);
        } catch (err) {
            console.error("[ReceiptPopup] Error generating receipt image:", err);
        } finally {
            setIsGeneratingImage(false);
        }
    };

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
                    <div className="rounded-lg border bg-muted/50 overflow-hidden">
                        {isGeneratingImage ? (
                            <div className="flex h-96 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : receiptImageUrl ? (
                            <div className="relative w-full h-96">
                                <Image
                                    src={receiptImageUrl}
                                    alt="Receipt Preview"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="flex h-96 items-center justify-center">
                                <p className="text-muted-foreground">Failed to generate preview</p>
                            </div>
                        )}
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

