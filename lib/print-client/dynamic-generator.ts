
import { ReceiptData } from "@/lib/receipt-generator";
import { ReceiptSettings } from "@/lib/api/receipt-settings/types";
import { EscPosEncoder } from "./esc-pos-encoder";
import { imageUrlToBitmap } from "./image-utils";

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

export const generateDynamicPrintCommand = async (
    data: ReceiptData,
    settings: ReceiptSettings,
    encoder: EscPosEncoder,
    printerSettings: PrinterSettings = DEFAULT_SETTINGS
) => {
    const currency = data.currencySymbol || '$';
    const maxWidth = Math.min(
        Math.floor((printerSettings.paperWidthMm * 203 / 25.4) * 0.8),
        576
    );

    encoder.initialize().align('center');

    const selectedFont = settings.printer_font || 'A';
    if (selectedFont === 'B') {
        encoder.raw([0x1B, 0x4D, 0x01]);
    } else if (selectedFont === 'C') {
        encoder.raw([0x1B, 0x4D, 0x02]);
    } else {
        encoder.raw([0x1B, 0x4D, 0x00]);
    }

    if (settings.include_image && data.storeLogo) {
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

    const lineChar = settings.line_character && settings.line_character.length > 0 ? settings.line_character[0] : '-';
    const createDivider = () => {
        return lineChar.repeat(printerSettings.charsPerLine).substring(0, printerSettings.charsPerLine);
    };

    encoder.text(createDivider()).newline();
    encoder.align('left');

    const printLabelValue = (enabled: boolean | undefined, label: string | null | undefined, value: string | undefined) => {
        if (enabled === false) return;

        if (label && value) {
            encoder.leftRight(`${label}:`, value, printerSettings.charsPerLine).newline();
        } else if (!label && value) {
            encoder.text(value).newline();
        }
    };

    const isEnabled = (val: boolean | undefined) => val !== false;

    if (isEnabled(settings.label_receipt_id_enabled)) printLabelValue(true, settings.label_receipt_id || 'Receipt #', data.receiptNumber);
    if (isEnabled(settings.label_transaction_id_enabled)) printLabelValue(true, settings.label_transaction_id, data.transactionId);
    if (isEnabled(settings.label_date_enabled)) printLabelValue(true, settings.label_date || 'Date', data.date);
    if (isEnabled(settings.label_time_enabled)) printLabelValue(true, settings.label_time || 'Time', data.time);
    if (isEnabled(settings.label_cashier_enabled)) printLabelValue(true, settings.label_cashier || 'Cashier', data.cashierName);
    if (isEnabled(settings.label_customer_enabled)) printLabelValue(true, settings.label_customer || 'Customer', data.customerName);

    encoder.text(createDivider()).newline();

    if (isEnabled(settings.label_items_enabled) && settings.label_items) {
        encoder.align('center').text(`--- ${settings.label_items} ---`).newline().align('left');
    }

    const itemLayout = Number(settings.item_layout ?? 0);

    data.items.forEach(item => {
        if (itemLayout === 1) {
            encoder.bold(true).text(item.name).newline().bold(false);
            encoder.leftRight(
                `  ${item.quantity} x ${currency}${item.price.toFixed(2)}`,
                `${currency}${item.total.toFixed(2)}`,
                printerSettings.charsPerLine
            ).newline();
        } else {
            encoder.leftRight(
                `${item.quantity} x ${item.name}`,
                `${currency}${item.total.toFixed(2)}`,
                printerSettings.charsPerLine
            ).newline();
        }
    });

    encoder.text(createDivider()).newline();

    if (isEnabled(settings.label_subtotal_enabled)) printLabelValue(true, settings.label_subtotal || 'Subtotal', `${currency}${data.subtotal.toFixed(2)}`);

    if (data.discount && isEnabled(settings.label_discount_enabled)) {
        printLabelValue(true, settings.label_discount || 'Discount', `-${currency}${data.discount.toFixed(2)}`);
    }

    if (data.tax !== undefined && isEnabled(settings.label_tax_enabled)) {
        printLabelValue(true, settings.label_tax || 'Tax', `${currency}${data.tax.toFixed(2)}`);
    }

    if (isEnabled(settings.label_total_enabled)) {
        encoder.bold(true);
        printLabelValue(true, settings.label_total || 'TOTAL', `${currency}${data.total.toFixed(2)}`);
        encoder.bold(false);
    }

    encoder.text(createDivider()).newline();

    if (isEnabled(settings.label_payment_method_enabled)) printLabelValue(true, settings.label_payment_method || 'Payment', data.paymentMethod);

    if (data.paymentAmount && isEnabled(settings.label_amount_paid_enabled)) {
        printLabelValue(true, settings.label_amount_paid || 'Paid', `${currency}${data.paymentAmount.toFixed(2)}`);
    }

    if (data.changeAmount && isEnabled(settings.label_change_enabled)) {
        printLabelValue(true, settings.label_change || 'Change', `${currency}${data.changeAmount.toFixed(2)}`);
    }

    const footer = settings.footer_message || data.footer;
    if (footer) {
        encoder.newline().align('center').text(footer).newline();
    }

    const qrcode = settings.qrcode_data || data.qrcode;
    if (qrcode) {
        encoder.newline().align('center').qrcode(qrcode, 6).newline();
    }

    for (let i = 0; i < printerSettings.feedLines; i++) {
        encoder.newline();
    }

    if (printerSettings.cutEnabled) {
        encoder.cut();
    }
};
