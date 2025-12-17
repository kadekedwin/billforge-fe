import { ReceiptData } from "@/lib/receipt-generator";
import { EscPosEncoder } from "../esc-pos-encoder";
import { imageUrlToBitmap } from "../image-utils";
import { PrinterSettings } from "./template0";

const DEFAULT_SETTINGS: PrinterSettings = {
    paperWidthMm: 80,
    charsPerLine: 48,
    encoding: 'UTF-8',
    feedLines: 3,
    cutEnabled: true,
};

export const generatePrintTemplate1 = async (
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

    encoder.bold(true).text(data.storeName).newline().bold(false);
    if (data.storePhone) {
        encoder.text(data.storePhone).newline();
    }
    encoder.text(`${data.date} ${data.time}`).newline();
    if (data.transactionId) {
        encoder.text(`Transaction: ${data.transactionId}`).newline();
    }

    encoder.dashedLine(settings.charsPerLine).newline();

    data.items.forEach(item => {
        const itemLine = `${item.quantity}x ${item.name}`;
        const priceLine = `${currency}${item.total.toFixed(2)}`;
        encoder.leftRight(itemLine, priceLine, settings.charsPerLine).newline();
    });

    encoder.dashedLine(settings.charsPerLine).newline();

    encoder.align('left');
    encoder.leftRight('Subtotal:', `${currency}${data.subtotal.toFixed(2)}`, settings.charsPerLine).newline();
    if (data.discount) {
        encoder.leftRight('Discount:', `-${currency}${data.discount.toFixed(2)}`, settings.charsPerLine).newline();
    }

    encoder.bold(true).leftRight('TOTAL:', `${currency}${data.total.toFixed(2)}`, settings.charsPerLine).newline().bold(false);

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
