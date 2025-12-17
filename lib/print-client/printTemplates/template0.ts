import { ReceiptData } from "@/lib/receipt-generator";
import { EscPosEncoder } from "../esc-pos-encoder";
import { imageUrlToBitmap } from "../image-utils";

export interface PrinterSettings {
    paperWidthMm: number;
    charsPerLine: number;
    encoding: string;
    feedLines: number;
    cutEnabled: boolean;
}

const DEFAULT_SETTINGS: PrinterSettings = {
    paperWidthMm: 80,
    charsPerLine: 48,
    encoding: 'UTF-8',
    feedLines: 3,
    cutEnabled: true,
};

export const generatePrintTemplate0 = async (
    data: ReceiptData,
    encoder: EscPosEncoder,
    settings: PrinterSettings = DEFAULT_SETTINGS
) => {
    const currency = data.currencySymbol || '$';
    const maxWidth = Math.floor((settings.paperWidthMm / 25.4) * 203);

    encoder.initialize().align('center');

    if (data.storeLogo) {
        try {
            const { bitmap, width } = await imageUrlToBitmap(data.storeLogo, maxWidth);
            encoder.image(bitmap, width).newline();
        } catch (error) {
            console.warn('Logo not loaded');
        }
    }

    encoder.bold(true).size(2, 2).text(data.storeName).newline().size(1, 1).bold(false);

    if (data.storeAddress) {
        encoder.text(data.storeAddress).newline();
    }
    if (data.storePhone) {
        encoder.text(data.storePhone).newline();
    }

    encoder.dashedLine(settings.charsPerLine).newline();


    encoder.align('left');
    encoder.leftRight('Receipt #:', data.receiptNumber, settings.charsPerLine).newline();
    encoder.leftRight('Date:', data.date, settings.charsPerLine).newline();
    encoder.leftRight('Time:', data.time, settings.charsPerLine).newline();
    if (data.cashierName) {
        encoder.leftRight('Cashier:', data.cashierName, settings.charsPerLine).newline();
    }
    if (data.customerName) {
        encoder.leftRight('Customer:', data.customerName, settings.charsPerLine).newline();
    }

    encoder.dashedLine(settings.charsPerLine).newline();

    data.items.forEach(item => {
        encoder.bold(true).leftRight(item.name, `${currency}${item.total.toFixed(2)}`, settings.charsPerLine).newline().bold(false);
        encoder.text(`  ${item.quantity} x ${currency}${item.price.toFixed(2)}`).newline();
    });

    encoder.dashedLine(settings.charsPerLine).newline();

    encoder.leftRight('Subtotal:', `${currency}${data.subtotal.toFixed(2)}`, settings.charsPerLine).newline();
    if (data.discount) {
        encoder.leftRight('Discount:', `-${currency}${data.discount.toFixed(2)}`, settings.charsPerLine).newline();
    }
    if (data.tax !== undefined) {
        encoder.leftRight('Tax:', `${currency}${data.tax.toFixed(2)}`, settings.charsPerLine).newline();
    }
    encoder.bold(true).leftRight('TOTAL:', `${currency}${data.total.toFixed(2)}`, settings.charsPerLine).newline().bold(false);

    encoder.dashedLine(settings.charsPerLine).newline();

    encoder.leftRight('Payment:', data.paymentMethod, settings.charsPerLine).newline();
    if (data.paymentAmount) {
        encoder.leftRight('Paid:', `${currency}${data.paymentAmount.toFixed(2)}`, settings.charsPerLine).newline();
    }
    if (data.changeAmount) {
        encoder.leftRight('Change:', `${currency}${data.changeAmount.toFixed(2)}`, settings.charsPerLine).newline();
    }

    if (data.footer) {
        encoder.newline().align('center').text(data.footer).newline();
    }

    if (data.qrcode) {
        encoder.newline().align('center').qrcode(data.qrcode, 6).newline();
    }

    for (let i = 0; i < settings.feedLines; i++) {
        encoder.newline();
    }

    if (settings.cutEnabled) {
        encoder.cut();
    }
};
