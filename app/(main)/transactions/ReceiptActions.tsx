"use client";

import { Button } from "@/components/ui/button";
import { Download, Mail, MessageCircle, Loader2, Printer } from "lucide-react";
import type { Customer } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ReceiptActionsProps {
    customer: Customer | null;
    receiptLoading: boolean;
    isPrinting: boolean;
    isSendingEmail: boolean;
    isSendingWhatsApp: boolean;

    onPrint: () => void;
    onDownloadPDF: () => void;
    onDownloadImage: () => void;
    onSendEmail: () => void;
    onSendWhatsApp: () => void;

}

export function ReceiptActions({
    customer,
    receiptLoading,
    isPrinting,
    isSendingEmail,
    isSendingWhatsApp,
    onPrint,
    onDownloadPDF,
    onDownloadImage,
    onSendEmail,
    onSendWhatsApp,
}: ReceiptActionsProps) {
    const { t } = useTranslation();
    const hasEmail = !!customer?.email;
    const hasPhone = !!customer?.phone;

    return (
        <div className="space-y-2 pt-4 border-t">
            <Button
                onClick={onPrint}
                disabled={isPrinting}
                className="w-full mb-2"
                variant="default"
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
                    {t('app.transactions.downloadPDF')}
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
                    {t('app.transactions.downloadImage')}
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
                            {t('app.transactions.sendEmail')}
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
                            {t('app.transactions.sendWhatsApp')}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}