import { ReceiptData } from '@/lib/receipt-generator';
import { EscPosEncoder } from './esc-pos-encoder';

export const generateThermalClassicCommands = (data: ReceiptData, encoder: EscPosEncoder) => {
    const currency = data.currencySymbol || '$';

    encoder.initialize()
        .align('center')
        .bold(true).size(2, 2).text(data.storeName).newline()
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

    encoder.text('-'.repeat(32)).newline(); // Separator for standard 58mm (approx 32 chars)

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

    encoder.text('-'.repeat(32)).newline();

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

    encoder.text('-'.repeat(32)).newline();

    encoder.align('center')
        .text(`Payment: ${data.paymentMethod}`).newline();

    if (data.footer) {
        encoder.newline().text(data.footer).newline();
    }

    encoder.newline()
        .text('Thank You!').newline()
        .newline()
        .newline()
        .cut();
};

export const generateThermalCompactCommands = (data: ReceiptData, encoder: EscPosEncoder) => {
    // Similar structure but more compact
    // Implementation simplified for brevity, following classic logic but tighter spacing
    const currency = data.currencySymbol || '$';

    encoder.initialize()
        .align('center')
        .bold(true).text(data.storeName).newline()
        .bold(false)
        .text(`${data.date} ${data.time}`).newline()
        .text('-'.repeat(32)).newline();

    data.items.forEach(item => {
        encoder.align('left')
            .text(`${item.quantity} ${item.name}`).newline()
            .align('right')
            .text(`${currency}${item.total.toFixed(2)}`).newline();
    });

    encoder.text('-'.repeat(32)).newline();
    encoder.align('right').bold(true).text(`TOTAL: ${currency}${data.total.toFixed(2)}`).newline();
    encoder.cut();
};

export const generateThermalDetailedCommands = (data: ReceiptData, encoder: EscPosEncoder) => {
    // Detailed implementation
    generateThermalClassicCommands(data, encoder); // Reuse classic for now as base
};
