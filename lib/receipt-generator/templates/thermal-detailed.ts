import { ReceiptData } from '../types';

export function generateThermalDetailedHTML(data: ReceiptData): string {
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
            line-height: 1.5;
            padding: 10px;
            max-width: 300px;
        }
        .center {
            text-align: center;
        }
        .bold {
            font-weight: bold;
        }
        .store-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .store-info {
            font-size: 11px;
            margin-bottom: 2px;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
        }
        .section-title {
            font-weight: bold;
            margin-bottom: 6px;
        }
        .info-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 11px;
        }
        .item {
            margin-bottom: 8px;
        }
        .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
        }
        .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-top: 2px;
        }
        .totals {
            margin-top: 10px;
        }
        .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .total-line.grand {
            font-weight: bold;
            font-size: 15px;
            margin-top: 6px;
            padding-top: 6px;
            border-top: 2px solid #000;
        }
        .footer {
            margin-top: 12px;
            font-size: 11px;
        }
        .qrcode {
            margin: 12px auto;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="center">
        ${data.storeLogo ? `<img src="${data.storeLogo}" alt="${data.storeName}" style="width: 80px; height: 80px; margin-bottom: 8px; object-fit: contain;">` : ''}
        <div class="store-name">${data.storeName}</div>
        ${data.storeAddress ? `<div class="store-info">${data.storeAddress}</div>` : ''}
        ${data.storePhone ? `<div class="store-info">Tel: ${data.storePhone}</div>` : ''}
    </div>
    
    <div class="divider"></div>
    
    <div class="section-title">Receipt Information</div>
    <div class="info-line">
        <span>Receipt No:</span>
        <span>${data.receiptNumber}</span>
    </div>
    ${data.transactionId ? `
    <div class="info-line">
        <span>Transaction ID:</span>
        <span>${data.transactionId}</span>
    </div>
    ` : ''}
    <div class="info-line">
        <span>Date:</span>
        <span>${data.date}</span>
    </div>
    <div class="info-line">
        <span>Time:</span>
        <span>${data.time}</span>
    </div>
    ${data.cashierName ? `
    <div class="info-line">
        <span>Cashier:</span>
        <span>${data.cashierName}</span>
    </div>
    ` : ''}
    ${data.customerName ? `
    <div class="info-line">
        <span>Customer:</span>
        <span>${data.customerName}</span>
    </div>
    ` : ''}
    
    <div class="divider"></div>
    
    <div class="section-title">Items</div>
    ${data.items.map(item => `
        <div class="item">
            <div class="item-header">
                <span>${item.name}</span>
                <span>${currencySymbol}${item.total.toFixed(2)}</span>
            </div>
            <div class="item-details">
                <span>Qty: ${item.quantity}</span>
                <span>@ ${currencySymbol}${item.price.toFixed(2)}</span>
            </div>
        </div>
    `).join('')}
    
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
    
    <div class="section-title">Payment Details</div>
    <div class="info-line">
        <span>Method:</span>
        <span>${data.paymentMethod}</span>
    </div>
    ${data.paymentAmount ? `
    <div class="info-line">
        <span>Amount Paid:</span>
        <span>${currencySymbol}${data.paymentAmount.toFixed(2)}</span>
    </div>
    ` : ''}
    ${data.changeAmount ? `
    <div class="info-line">
        <span>Change:</span>
        <span>${currencySymbol}${data.changeAmount.toFixed(2)}</span>
    </div>
    ` : ''}
    
    ${data.footer ? `
    <div class="divider"></div>
    <div class="footer center">${data.footer}</div>
    ` : ''}
    
    ${data.qrcode ? `
    <div class="qrcode-container" style="display: flex; justify-content: center; margin-top: 12px;">
        <div id="qrcode"></div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>
        (function() {
            var qrcode = new QRCode(document.getElementById("qrcode"), {
                text: "${data.qrcode}",
                width: 120,
                height: 120,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        })();
    </script>
    ` : ''}
    
    <div class="divider"></div>
    <div class="center bold" style="margin-top: 12px;">Thank You For Your Purchase!</div>
    <div class="center" style="margin-top: 4px; font-size: 10px;">Please Come Again</div>
</body>
</html>
    `.trim();
}
