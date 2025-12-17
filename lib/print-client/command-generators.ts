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
            console.warn('Logo image could not be loaded, printing receipt without logo:', error instanceof Error ? error.message : error);
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

    data.items.forEach(item => {
        encoder.align('left')
            .text(item.name).newline();

        const qtyPrice = `${item.quantity}x @ ${item.price.toFixed(2)}`;
        const total = `${currency}${item.total.toFixed(2)}`;

        encoder.leftRight(qtyPrice, total, settings.charsPerLine).newline();
    });

    encoder.text(separator).newline();

    const printTotalLine = (label: string, value: string) => {
        encoder.leftRight(label, value, settings.charsPerLine).newline();
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
        .bold(false);

    if (data.storePhone) {
        encoder.text(data.storePhone).newline();
    }

    encoder.text(`${data.date} ${data.time}`).newline()
        .text(separator).newline();

    data.items.forEach(item => {
        const itemLine = `${item.quantity}x ${item.name}`;
        const priceLine = `${currency}${item.total.toFixed(2)}`;
        encoder.leftRight(itemLine, priceLine, settings.charsPerLine).newline();
    });

    encoder.text(separator).newline();

    if (data.tax) {
        encoder.align('right').text(`Tax: ${currency}${data.tax.toFixed(2)}`).newline();
    }
    if (data.discount) {
        encoder.align('right').text(`Disc: -${currency}${data.discount.toFixed(2)}`).newline();
    }

    encoder.align('right').bold(true).size(1, 2)
        .text(`TOTAL: ${currency}${data.total.toFixed(2)}`)
        .newline().size(1, 1).bold(false);

    if (data.qrcode) {
        encoder.newline()
            .align('center')
            .qrcode(data.qrcode, 4)
            .newline();
    }

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
    const currency = data.currencySymbol || '$';
    const maxWidth = Math.floor((settings.paperWidthMm / 25.4) * 203);
    const separator = '='.repeat(Math.min(settings.charsPerLine, 48));
    const thinSeparator = '-'.repeat(Math.min(settings.charsPerLine, 48));

    encoder.initialize()
        .align('center');

    if (data.storeLogo) {
        try {
            const bitmap = await imageUrlToBitmap(data.storeLogo, maxWidth);
            encoder.image(bitmap, maxWidth).newline();
        } catch (error) {
            console.warn('Logo image could not be loaded, printing receipt without logo:', error instanceof Error ? error.message : error);
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

    encoder.text(separator).newline()
        .align('left')
        .bold(true).text('RECEIPT DETAILS').bold(false).newline()
        .text(`Receipt #: ${data.receiptNumber}`).newline()
        .text(`Date: ${data.date}`).newline()
        .text(`Time: ${data.time}`).newline();

    if (data.cashierName) encoder.text(`Cashier: ${data.cashierName}`).newline();
    if (data.customerName) encoder.text(`Customer: ${data.customerName}`).newline();

    encoder.text(separator).newline()
        .bold(true).text('ITEMS').bold(false).newline()
        .text(thinSeparator).newline();

    data.items.forEach((item, index) => {
        encoder.align('left')
            .text(`${index + 1}. ${item.name}`).newline()
            .text(`   Qty: ${item.quantity} x ${currency}${item.price.toFixed(2)}`).newline()
            .align('right')
            .text(`${currency}${item.total.toFixed(2)}`).newline();
        if (index < data.items.length - 1) {
            encoder.text(thinSeparator).newline();
        }
    });

    encoder.text(separator).newline()
        .bold(true).text('SUMMARY').bold(false).newline();

    const printLine = (label: string, value: string) => {
        encoder.leftRight(label, value, settings.charsPerLine).newline();
    };

    printLine('Subtotal:', `${currency}${data.subtotal.toFixed(2)}`);
    if (data.tax) printLine('Tax:', `${currency}${data.tax.toFixed(2)}`);
    if (data.discount) printLine('Discount:', `-${currency}${data.discount.toFixed(2)}`);

    encoder.text(separator).newline()
        .bold(true).size(1, 2)
        .align('center').text(`TOTAL: ${currency}${data.total.toFixed(2)}`).newline()
        .size(1, 1).bold(false)
        .text(separator).newline();

    encoder.align('left')
        .text(`Payment Method: ${data.paymentMethod}`).newline();

    if (data.footer) {
        encoder.newline().align('center').text(data.footer).newline();
    }

    if (data.qrcode) {
        encoder.newline()
            .align('center')
            .qrcode(data.qrcode, 6)
            .newline()
            .newline();
    }

    encoder.newline()
        .align('center')
        .text('Thank You for Your Business!').newline();

    for (let i = 0; i < settings.feedLines; i++) {
        encoder.newline();
    }

    if (settings.cutEnabled) {
        encoder.cut();
    }
};
