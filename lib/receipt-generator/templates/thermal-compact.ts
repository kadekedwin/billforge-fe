import { ReceiptData } from '../types';

export function generateThermalCompactHTML(data: ReceiptData): string {
    const currencySymbol = data.currencySymbol || '$';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            padding: 6px;
            max-width: 300px;
        }
        .center {
            text-align: center;
        }
        .bold {
            font-weight: bold;
        }
        .store-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        .item-name {
            flex: 1;
        }
        .item-total {
            width: 70px;
            text-align: right;
        }
        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        .total-line.grand {
            font-weight: bold;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="center">
        ${data.storeLogo ? `<img src="${data.storeLogo}" alt="${data.storeName}" style="width: 40px; height: 40px; margin-bottom: 4px; object-fit: contain;">` : ''}
        <div class="store-name">${data.storeName}</div>
        <div style="font-size: 10px;">${data.date} ${data.time}</div>
        <div style="font-size: 10px;">No: ${data.receiptNumber}</div>
    </div>
    
    <div class="divider"></div>
    
    ${data.items.map(item => `
        <div class="item">
            <div class="item-name">${item.quantity}x ${item.name}</div>
            <div class="item-total">${currencySymbol}${item.total.toFixed(2)}</div>
        </div>
    `).join('')}
    
    <div class="divider"></div>
    
    <div class="total-line">
        <span>Subtotal</span>
        <span>${currencySymbol}${data.subtotal.toFixed(2)}</span>
    </div>
    ${data.tax ? `
    <div class="total-line">
        <span>Tax</span>
        <span>${currencySymbol}${data.tax.toFixed(2)}</span>
    </div>
    ` : ''}
    ${data.discount ? `
    <div class="total-line">
        <span>Discount</span>
        <span>-${currencySymbol}${data.discount.toFixed(2)}</span>
    </div>
    ` : ''}
    <div class="total-line grand">
        <span>TOTAL</span>
        <span>${currencySymbol}${data.total.toFixed(2)}</span>
    </div>
    
    <div class="divider"></div>
    
    <div class="center">
        <div>${data.paymentMethod}</div>
        ${data.paymentAmount ? `<div>Paid: ${currencySymbol}${data.paymentAmount.toFixed(2)}</div>` : ''}
        ${data.changeAmount ? `<div>Change: ${currencySymbol}${data.changeAmount.toFixed(2)}</div>` : ''}
    </div>
    
    ${data.footer ? `
    <div class="divider"></div>
    <div class="center" style="font-size: 10px;">${data.footer}</div>
    ` : ''}
    
    ${data.qrcode ? `
    <div class="center" style="margin-top: 8px; display: flex; justify-content: center;">
        <div id="qrcode"></div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>
        (function() {
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                text: "${data.qrcode}",
                width: 80,
                height: 80,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        })();
    </script>
    ` : ''}
    
    <div class="center" style="margin-top: 8px; font-size: 10px;">Thank You!</div>
</body>
</html>
    `.trim();
}
