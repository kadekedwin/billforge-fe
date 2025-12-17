import { ReceiptData } from '@/lib/receipt-generator';
import { EscPosEncoder } from './esc-pos-encoder';
import { imageUrlToBitmap } from './image-utils';

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

export const generateThermalClassicCommands = async (
    data: ReceiptData,
    encoder: EscPosEncoder,
    settings: PrinterSettings = DEFAULT_SETTINGS
) => {
    const currency = data.currencySymbol || '$';
    const maxWidth = Math.floor((settings.paperWidthMm / 25.4) * 203);

    encoder.initialize()
        .align('center');

    if (data.storeLogo) {
        try {
            const bitmap = await imageUrlToBitmap(data.storeLogo, maxWidth);
            encoder.image(bitmap, maxWidth).newline();
        } catch (error) {
            console.error('Failed to load logo:', error);
        }
    }

    encoder.bold(true).size(2, 2).text(data.storeName).newline()
        .size(1, 1).bold(false);

    if (data.storeAddress) {
        encoder.text(data.storeAddress).newline();
    }
    if (data.storePhone) {
        encoder.text(data.storePhone).newline();
    }

    encoder.newline()
        .align('left')
        .text(`Receipt: ${data.receiptNumber}`).newline()
        .text(`Date: ${data.date} ${data.time}`).newline();

    if (data.cashierName) encoder.text(`Cashier: ${data.cashierName}`).newline();
    if (data.customerName) encoder.text(`Customer: ${data.customerName}`).newline();

    const separator = '-'.repeat(Math.min(settings.charsPerLine, 48));
    encoder.text(separator).newline();

    // Items
    data.items.forEach(item => {
        encoder.align('left')
            .text(item.name).newline();

        // Naive column alignment for qty/price
        const qtyPrice = `${item.quantity}x @ ${item.price.toFixed(2)}`;
        const total = `${currency}${item.total.toFixed(2)}`;

        // Just print right aligned total on next line for simplicity in this basic template
        encoder.align('right')
            .text(`${qtyPrice}   ${total}`).newline();
    });

    encoder.text(separator).newline();

    // Totals
    const printTotalLine = (label: string, value: string) => {
        // Simple right align logic
        encoder.align('right').text(`${label}: ${value}`).newline();
    };

    printTotalLine('Subtotal', `${currency}${data.subtotal.toFixed(2)}`);
    if (data.tax) printTotalLine('Tax', `${currency}${data.tax.toFixed(2)}`);
    if (data.discount) printTotalLine('Discount', `-${currency}${data.discount.toFixed(2)}`);

    encoder.bold(true).size(1, 2)
        .align('right').text(`TOTAL: ${currency}${data.total.toFixed(2)}`).newline()
        .size(1, 1).bold(false);

    encoder.text(separator).newline();

    encoder.align('center')
        .text(`Payment: ${data.paymentMethod}`).newline();

    if (data.footer) {
        encoder.newline().text(data.footer).newline();
    }

    if (data.qrcode) {
        encoder.newline()
            .align('center')
            .qrcode(data.qrcode, 6)
            .newline();
    }

    encoder.newline()
        .text('Thank You!').newline();

    for (let i = 0; i < settings.feedLines; i++) {
        encoder.newline();
    }

    if (settings.cutEnabled) {
        encoder.cut();
    }
};

export const generateThermalCompactCommands = async (
    data: ReceiptData,
    encoder: EscPosEncoder,
    settings: PrinterSettings = DEFAULT_SETTINGS
) => {
    const currency = data.currencySymbol || '$';
    const separator = '-'.repeat(Math.min(settings.charsPerLine, 48));

    encoder.initialize()
        .align('center')
        .bold(true).text(data.storeName).newline()
        .bold(false)
        .text(`${data.date} ${data.time}`).newline()
        .text(separator).newline();

    data.items.forEach(item => {
        encoder.align('left')
            .text(`${item.quantity} ${item.name}`).newline()
            .align('right')
            .text(`${currency}${item.total.toFixed(2)}`).newline();
    });

    encoder.text(separator).newline();
    encoder.align('right').bold(true).text(`TOTAL: ${currency}${data.total.toFixed(2)}`).newline();

    for (let i = 0; i < settings.feedLines; i++) {
        encoder.newline();
    }

    if (settings.cutEnabled) {
        encoder.cut();
    }
};

export const generateThermalDetailedCommands = async (
    data: ReceiptData,
    encoder: EscPosEncoder,
    settings: PrinterSettings = DEFAULT_SETTINGS
) => {
    await generateThermalClassicCommands(data, encoder, settings);
};
