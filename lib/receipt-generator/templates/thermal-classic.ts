import { ReceiptData } from '../types';

export function generateThermalClassicHTML(data: ReceiptData): string {
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
            font-size: 12px;
            line-height: 1.4;
            padding: 8px;
            max-width: 300px;
        }
        .center {
            text-align: center;
        }
        .bold {
            font-weight: bold;
        }
        .store-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .store-info {
            font-size: 11px;
            margin-bottom: 2px;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
        }
        .receipt-info {
            margin-bottom: 8px;
        }
        .items {
            margin: 8px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .item-name {
            flex: 1;
        }
        .item-qty {
            width: 40px;
            text-align: right;
        }
        .item-price {
            width: 60px;
            text-align: right;
        }
        .totals {
            margin-top: 8px;
        }
        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .total-line.grand {
            font-weight: bold;
            font-size: 14px;
            margin-top: 4px;
        }
        .footer {
            margin-top: 12px;
            font-size: 11px;
        }
        .qrcode-container {
            display: flex;
            justify-content: center;
            margin-top: 12px;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
</head>
<body>
    <div class="center">
        ${data.storeLogo ? `<img src="${data.storeLogo}" alt="${data.storeName}" style="width: 60px; height: 60px; margin-bottom: 8px; object-fit: contain;">` : ''}
        <div class="store-name">${data.storeName}</div>
        ${data.storeAddress ? `<div class="store-info">${data.storeAddress}</div>` : ''}
        ${data.storePhone ? `<div class="store-info">${data.storePhone}</div>` : ''}
    </div>
    
    <div class="divider"></div>
    
    <div class="receipt-info">
        <div>Receipt: ${data.receiptNumber}</div>
        <div>Date: ${data.date} ${data.time}</div>
        ${data.cashierName ? `<div>Cashier: ${data.cashierName}</div>` : ''}
        ${data.customerName ? `<div>Customer: ${data.customerName}</div>` : ''}
    </div>
    
    <div class="divider"></div>
    
    <div class="items">
        ${data.items.map(item => `
            <div class="item">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">${item.quantity}x</div>
                <div class="item-price">${currencySymbol}${item.total.toFixed(2)}</div>
            </div>
        `).join('')}
    </div>
    
    <div class="divider"></div>
    
    <div class="totals">
        <div class="total-line">
            <span>Subtotal:</span>
            <span>${currencySymbol}${data.subtotal.toFixed(2)}</span>
        </div>
        ${data.tax ? `
        <div class="total-line">
            <span>Tax:</span>
            <span>${currencySymbol}${data.tax.toFixed(2)}</span>
        </div>
        ` : ''}
        ${data.discount ? `
        <div class="total-line">
            <span>Discount:</span>
            <span>-${currencySymbol}${data.discount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-line grand">
            <span>TOTAL:</span>
            <span>${currencySymbol}${data.total.toFixed(2)}</span>
        </div>
    </div>
    
    <div class="divider"></div>
    
    <div class="center">
        <div>Payment: ${data.paymentMethod}</div>
        ${data.paymentAmount ? `<div>Paid: ${currencySymbol}${data.paymentAmount.toFixed(2)}</div>` : ''}
        ${data.changeAmount ? `<div>Change: ${currencySymbol}${data.changeAmount.toFixed(2)}</div>` : ''}
    </div>
    
    ${data.footer ? `
    <div class="divider"></div>
    <div class="footer center">${data.footer}</div>
    ` : ''}
    
    ${data.qrcode ? `
    <div class="qrcode-container">
        <div id="qrcode"></div>
    </div>
    <script>
        (function() {
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                text: "${data.qrcode}",
                width: 100,
                height: 100,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        })();
    </script>
    ` : ''}
    
    <div class="divider"></div>
    <div class="center" style="margin-top: 12px;">Thank You!</div>
</body>
</html>
    `.trim();
}
