import { ReceiptData } from "@/lib/receipt-generator";
import { EscPosEncoder } from "../esc-pos-encoder";
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

    encoder.initialize().align('center');

    encoder.bold(true).text(data.storeName).newline().bold(false);
    if (data.storePhone) {
        encoder.text(data.storePhone).newline();
    }
    encoder.text(`${data.date} ${data.time}`).newline();

    encoder.dashedLine(settings.charsPerLine).newline();

    data.items.forEach(item => {
        const itemLine = `${item.quantity}x ${item.name}`;
        const priceLine = `${currency}${item.total.toFixed(2)}`;
        encoder.leftRight(itemLine, priceLine, settings.charsPerLine).newline();
    });

    encoder.dashedLine(settings.charsPerLine).newline();

    encoder.align('right');
    encoder.text(`Subtotal: ${currency}${data.subtotal.toFixed(2)}`).newline();
    if (data.discount) {
        encoder.text(`Discount: -${currency}${data.discount.toFixed(2)}`).newline();
    }

    encoder.bold(true).size(1, 2).text(`TOTAL: ${currency}${data.total.toFixed(2)}`).newline().size(1, 1).bold(false);

    encoder.newline().align('center').text('Thank You!').newline();

    for (let i = 0; i < settings.feedLines; i++) {
        encoder.newline();
    }

    if (settings.cutEnabled) {
        encoder.cut();
    }
};
