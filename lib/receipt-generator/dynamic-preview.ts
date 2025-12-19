
import { ReceiptData } from './types';
import { ReceiptSettings } from '@/lib/api/receipt-settings/types';

export const generateDynamicReceiptHTML = (data: ReceiptData, settings: ReceiptSettings): string => {
    const currency = data.currencySymbol || '$';

    const isEnabled = (val: boolean | undefined) => val !== false;

    const getLabelRow = (enabled: boolean | undefined, label: string | null | undefined, value: string | undefined) => {
        if (enabled === false) return '';
        if (!value) return '';
        if (!label) {
            return `<div class="row"><span class="left">${value}</span></div>`;
        }
        return `
            <div class="row">
                <span class="left">${label}:</span>
                <span class="right">${value}</span>
            </div>
        `;
    };

    const itemLayout = Number(settings.item_layout ?? 0);

    const getItemsRows = () => {
        return data.items.map(item => {
            if (itemLayout === 1) {
                return `
                <div style="margin-bottom: 5px;">
                     <div class="bold text-left">${item.name}</div>
                     <div class="row">
                        <span class="left" style="padding-left: 10px;">${item.quantity} x ${currency}${item.price.toFixed(2)}</span>
                        <span class="right">${currency}${item.total.toFixed(2)}</span>
                     </div>
                </div>
                `;
            } else {
                return `
                <div class="row">
                    <span class="left">${item.quantity} x ${item.name}</span>
                    <span class="right">${currency}${item.total.toFixed(2)}</span>
                </div>
                `;
            }
        }).join('');
    };

    const lineChar = settings.line_character || '-';
    let borderStyle = 'dashed';
    if (lineChar === '.') borderStyle = 'dotted';
    else if (lineChar === '_') borderStyle = 'solid';
    else if (lineChar === '=') borderStyle = 'double';

    const dividerStyle = `border-top: 1px ${borderStyle} #000; margin: 10px 0;`;

    const font = settings.font || 'A';
    const receiptStyleId = Number(settings.receipt_style_id ?? 0);

    let fontFamily = "'Courier New', Courier, monospace";
    let fontWeight = "normal";

    if (receiptStyleId === 1) { // Sans Serif
        fontFamily = "Inter, system-ui, -apple-system, sans-serif";
    }

    const fontSize = font === 'B' ? "12px" : "14px";

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .receipt {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            font-weight: ${fontWeight};
            line-height: 1.4;
            max-width: 300px;
            width: 100%;
            background-color: white;
            padding: 20px;
            color: #000;
        }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .row {
            display: flex;
            justify-content: space-between;
        }
        .left { text-align: left; }
        .right { text-align: right; }
        .divider {
            ${dividerStyle}
        }
        .logo {
            max-width: 80%;
            height: auto;
            display: block;
            margin: 0 auto 10px;
        }
        .text {
            margin-bottom: 2px;
        }
        .header-large {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .text-left { text-align: left; }
    </style>
</head>
<body>
    <div class="receipt">
    <div class="text-center">
        ${settings.include_image && data.storeLogo ? `<img src="${data.storeLogo}" class="logo" alt="Logo" />` : ''}
        <div class="header-large">${data.storeName}</div>
        ${data.storeAddress ? `<div class="text">${data.storeAddress}</div>` : ''}
        ${data.storePhone ? `<div class="text">${data.storePhone}</div>` : ''}
    </div>

    <div class="divider"></div>

    ${getLabelRow(settings.label_receipt_id_enabled, settings.label_receipt_id || 'Receipt #', data.receiptNumber)}
    ${getLabelRow(settings.label_transaction_id_enabled, settings.label_transaction_id, data.transactionId)}
    ${getLabelRow(settings.label_date_enabled, settings.label_date || 'Date', data.date)}
    ${getLabelRow(settings.label_time_enabled, settings.label_time || 'Time', data.time)}
    ${getLabelRow(settings.label_cashier_enabled, settings.label_cashier || 'Cashier', data.cashierName)}
    ${getLabelRow(settings.label_customer_enabled, settings.label_customer || 'Customer', data.customerName)}

    <div class="divider"></div>

    ${(isEnabled(settings.label_items_enabled) && settings.label_items) ? `<div class="text-center bold" style="margin-bottom: 5px;">--- ${settings.label_items} ---</div>` : ''}

    ${getItemsRows()}

    <div class="divider"></div>

    ${getLabelRow(settings.label_subtotal_enabled, settings.label_subtotal || 'Subtotal', `${currency}${data.subtotal.toFixed(2)}`)}
    ${data.discount ? getLabelRow(settings.label_discount_enabled, settings.label_discount || 'Discount', `-${currency}${data.discount.toFixed(2)}`) : ''}
    ${data.tax !== undefined ? getLabelRow(settings.label_tax_enabled, settings.label_tax || 'Tax', `${currency}${data.tax.toFixed(2)}`) : ''}
    
    ${isEnabled(settings.label_total_enabled) ? `
    <div class="row bold" style="margin-top: 5px;">
        <span class="left">${settings.label_total || 'TOTAL'}:</span>
        <span class="right">${currency}${data.total.toFixed(2)}</span>
    </div>` : ''}

    <div class="divider"></div>

    ${getLabelRow(settings.label_payment_method_enabled, settings.label_payment_method || 'Payment', data.paymentMethod)}
    ${data.paymentAmount ? getLabelRow(settings.label_amount_paid_enabled, settings.label_amount_paid || 'Paid', `${currency}${data.paymentAmount.toFixed(2)}`) : ''}
    ${data.changeAmount ? getLabelRow(settings.label_change_enabled, settings.label_change || 'Change', `${currency}${data.changeAmount.toFixed(2)}`) : ''}

    ${(settings.footer_message || data.footer) ? `
        <div class="divider"></div>
        <div class="text-center">
            ${settings.footer_message || data.footer}
        </div>
    ` : ''}

    ${(settings.qrcode_data || data.qrcode) ? `
        <div style="margin-top: 15px; text-align: center;">
            <div style="display: inline-block; padding: 10px; background: #fff; border: 1px solid #ccc;">
                QR Code: ${settings.qrcode_data || data.qrcode}
            </div>
        </div>
    ` : ''}

    </div>
</body>
</html>
    `;
};
