"use client";

import { Button } from "@/components/ui/button";
import { Download, Mail, MessageCircle, Loader2 } from "lucide-react";
import type { Customer } from "@/lib/api";

interface ReceiptActionsProps {
    customer: Customer | null;
    receiptLoading: boolean;
    isSendingEmail: boolean;
    isSendingWhatsApp: boolean;
    onDownloadPDF: () => void;
    onDownloadImage: () => void;
    onSendEmail: () => void;
    onSendWhatsApp: () => void;
}

export function ReceiptActions({
                                   customer,
                                   receiptLoading,
                                   isSendingEmail,
                                   isSendingWhatsApp,
                                   onDownloadPDF,
                                   onDownloadImage,
                                   onSendEmail,
                                   onSendWhatsApp,
                               }: ReceiptActionsProps) {
    const hasEmail = !!customer?.email;
    const hasPhone = !!customer?.phone;

    return (
        <div className="space-y-2 pt-4 border-t">
            <div className="flex gap-2">
                <Button
                    onClick={onDownloadPDF}
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
                    onClick={onDownloadImage}
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

            {(hasEmail || hasPhone) && (
                <div className="flex gap-2">
                    {hasEmail && (
                        <Button
                            onClick={onSendEmail}
                            disabled={isSendingEmail}
                            className={hasPhone ? "flex-1" : "w-full"}
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
                    {hasPhone && (
                        <Button
                            onClick={onSendWhatsApp}
                            disabled={isSendingWhatsApp}
                            className={hasEmail ? "flex-1" : "w-full"}
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
    );
}