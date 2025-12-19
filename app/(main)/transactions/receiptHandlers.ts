import type { Transaction, TransactionItem, Business, Customer } from "@/lib/api";
import { PDFGeneratorOptions, ImageGeneratorOptions } from "@/lib/receipt-generator/useReceiptGenerator";
import { ReceiptSettings } from "@/lib/api/receipt-settings/types";
import { ReceiptData } from "@/lib/receipt-generator/types";
import { convertTransactionToReceiptData } from "@/lib/receipt-generator/utils";


interface GenerateReceiptParams {
    transaction: Transaction;
    transactionItems: TransactionItem[];
    business: Business;
    customer: Customer | null;
    paymentMethodName: string;
    footerMessage?: string;
    businessLogoUrl?: string;
    qrcodeValue?: string;
}

export async function handleDownloadPDF(
    params: GenerateReceiptParams,
    generatePDF: (receiptData: ReceiptData, options?: PDFGeneratorOptions) => Promise<Blob>,
    settings: ReceiptSettings
): Promise<void> {
    try {
        const receiptData = convertTransactionToReceiptData(
            params.transaction,
            params.transactionItems,
            params.business,
            params.customer?.name,
            params.paymentMethodName,
            params.footerMessage,
            params.businessLogoUrl,
            params.qrcodeValue
        );

        await generatePDF(receiptData, { settings });
    } catch (err) {
        console.error("Error generating receipt:", err);
        throw new Error("Failed to generate receipt");
    }
}

export async function handleDownloadImage(
    params: GenerateReceiptParams,
    generateImage: (receiptData: ReceiptData, options?: ImageGeneratorOptions) => Promise<Blob>,
    settings: ReceiptSettings
): Promise<void> {
    try {
        const receiptData = convertTransactionToReceiptData(
            params.transaction,
            params.transactionItems,
            params.business,
            params.customer?.name,
            params.paymentMethodName,
            params.footerMessage,
            params.businessLogoUrl,
            params.qrcodeValue
        );

        await generateImage(receiptData, { type: 'png', settings });
    } catch (err) {
        console.error("Error downloading image:", err);
        throw new Error("Failed to download receipt image");
    }
}

export async function handleSendEmail(customerEmail: string): Promise<void> {
    try {
        // TODO: Implement email sending functionality
        console.log("Send receipt to email:", customerEmail);
        alert(`Receipt will be sent to ${customerEmail}`);
    } catch (err) {
        console.error("Error sending email:", err);
        throw new Error("Failed to send email");
    }
}

export async function handleSendWhatsApp(
    customerPhone: string,
    transactionUuid: string
): Promise<void> {
    try {
        // TODO: Implement WhatsApp sending functionality
        console.log("Send receipt to WhatsApp:", customerPhone);

        // For now, open WhatsApp web with the phone number
        const message = encodeURIComponent(`Receipt for transaction ${transactionUuid}`);
        const phoneNumber = customerPhone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } catch (err) {
        console.error("Error sending WhatsApp:", err);
        throw new Error("Failed to send WhatsApp message");
    }
}
