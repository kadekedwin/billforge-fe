import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { ReceiptData } from '@/lib/receipt/types';
import { PrinterConfig } from './types';

const getPrinterType = (type: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const types: Record<string, any> = {
        'EPSON': PrinterTypes.EPSON,
        'STAR': PrinterTypes.STAR,
        'TANCA': PrinterTypes.TANCA,
        'DARUMA': PrinterTypes.DARUMA,
    };
    return types[type] || PrinterTypes.EPSON;
};

export async function printThermalReceipt(data: ReceiptData, config?: PrinterConfig): Promise<void> {
    const printerConfig = config || {
        printerType: 'EPSON',
        printerPath: '/dev/usb/lp0',
        characterSet: 'PC437_USA',
        removeSpecialCharacters: false,
        lineCharacter: '-',
        timeout: 5000,
    };

    const printer = new ThermalPrinter({
        type: getPrinterType(printerConfig.printerType),
        interface: printerConfig.printerPath,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        characterSet: printerConfig.characterSet as any,
        removeSpecialCharacters: printerConfig.removeSpecialCharacters,
        lineCharacter: printerConfig.lineCharacter,
        options: {
            timeout: printerConfig.timeout,
        },
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
        throw new Error('Printer not connected');
    }

    printer.alignCenter();
    if (data.storeLogo) {
        printer.println(data.storeName);
    } else {
        printer.setTextSize(1, 1);
        printer.bold(true);
        printer.println(data.storeName);
        printer.bold(false);
        printer.setTextNormal();
    }

    if (data.storeAddress) {
        printer.println(data.storeAddress);
    }
    if (data.storePhone) {
        printer.println(`Tel: ${data.storePhone}`);
    }

    printer.drawLine();

    printer.alignLeft();
    printer.println(`Receipt #: ${data.receiptNumber}`);
    if (data.transactionId) {
        printer.println(`Transaction ID: ${data.transactionId}`);
    }
    printer.println(`Date: ${data.date}`);
    printer.println(`Time: ${data.time}`);
    if (data.cashierName) {
        printer.println(`Cashier: ${data.cashierName}`);
    }
    if (data.customerName) {
        printer.println(`Customer: ${data.customerName}`);
    }

    printer.drawLine();

    const currency = data.currencySymbol || '$';

    data.items.forEach(item => {
        printer.bold(true);
        printer.println(item.name);
        printer.bold(false);
        printer.tableCustom([
            { text: `${item.quantity} x ${currency}${item.price.toFixed(2)}`, align: 'LEFT', width: 0.7 },
            { text: `${currency}${item.total.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
        ]);
    });

    printer.drawLine();

    printer.tableCustom([
        { text: 'Subtotal:', align: 'LEFT', width: 0.7 },
        { text: `${currency}${data.subtotal.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
    ]);

    if (data.discount) {
        printer.tableCustom([
            { text: 'Discount:', align: 'LEFT', width: 0.7 },
            { text: `-${currency}${data.discount.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
        ]);
    }

    if (data.tax !== undefined) {
        printer.tableCustom([
            { text: 'Tax:', align: 'LEFT', width: 0.7 },
            { text: `${currency}${data.tax.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
        ]);
    }

    printer.drawLine();

    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.tableCustom([
        { text: 'TOTAL:', align: 'LEFT', width: 0.7 },
        { text: `${currency}${data.total.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
    ]);
    printer.setTextNormal();
    printer.bold(false);

    printer.drawLine();

    printer.println(`Payment Method: ${data.paymentMethod}`);
    if (data.paymentAmount) {
        printer.tableCustom([
            { text: 'Paid:', align: 'LEFT', width: 0.7 },
            { text: `${currency}${data.paymentAmount.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
        ]);
    }
    if (data.changeAmount) {
        printer.tableCustom([
            { text: 'Change:', align: 'LEFT', width: 0.7 },
            { text: `${currency}${data.changeAmount.toFixed(2)}`, align: 'RIGHT', width: 0.3 },
        ]);
    }

    if (data.footer) {
        printer.drawLine();
        printer.alignCenter();
        printer.println(data.footer);
    }

    if (data.notes) {
        printer.drawLine();
        printer.alignCenter();
        printer.setTextSize(0, 0);
        printer.println(data.notes);
        printer.setTextNormal();
    }

    if (data.qrcode) {
        printer.alignCenter();
        printer.printQR(data.qrcode, {
            cellSize: 6,
            correction: 'M',
            model: 2,
        });
    }

    printer.cut();

    await printer.execute();
}
