import { ReceiptData } from "@/lib/receipt";

export const generateSansSerifTemplate = (data: ReceiptData): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${data.receiptNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      background: white;
      padding: 0;
      margin: 0;
    }
    .receipt {
      max-width: 80mm;
      margin: 0;
      background: white;
      padding: 10px;
      border: none;
    }
    .header {
      text-align: center;
      border-bottom: 1px dashed #333;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }
    .store-logo {
      width: 60px;
      height: 60px;
      margin: 10px auto 20px;
      display: block;
      object-fit: contain;
    }
    .store-name {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .store-info {
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }
    .receipt-info {
      font-size: 11px;
      margin-bottom: 15px;
      border-bottom: 1px dashed #333;
      padding-bottom: 10px;
    }
    .receipt-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .items {
      margin-bottom: 15px;
      border-bottom: 1px dashed #333;
      padding-bottom: 10px;
    }
    .item {
      font-size: 12px;
      margin-bottom: 8px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .item-name {
      font-weight: bold;
    }
    .item-details {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #666;
      padding-left: 10px;
    }
    .totals {
      font-size: 12px;
      margin-bottom: 15px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .total-row.grand-total {
      font-size: 16px;
      font-weight: bold;
      border-top: 1px dashed #333;
      padding-top: 8px;
      margin-top: 8px;
    }
    .payment {
      font-size: 12px;
      margin-bottom: 15px;
      border-bottom: 1px dashed #333;
      padding-bottom: 10px;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #666;
      margin-top: 15px;
    }
    .notes {
      text-align: center;
      font-size: 10px;
      font-style: italic;
      margin-top: 10px;
      color: #999;
    }
    .qrcode-container {
      text-align: center;
      margin-top: 15px;
      padding-top: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .qrcode-container #qrcode {
      display: inline-block;
      line-height: 0;
    }
    .qrcode-container canvas {
      display: block !important;
      margin: 0 auto;
    }
    .qrcode-container img {
      display: none !important;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
</head>
<body>
  <div class="receipt">
    <div class="header">
      ${data.storeLogo ? `<img src="${data.storeLogo}" alt="${data.storeName}" class="store-logo" />` : ''}
      <div class="store-name">${data.storeName}</div>
      ${data.storeAddress || data.storePhone ? `
      <div class="store-info">
        ${data.storeAddress ? `${data.storeAddress}<br>` : ''}
        ${data.storePhone ? `Tel: ${data.storePhone}` : ''}
      </div>
      ` : ''}
    </div>
    <div class="receipt-info">
      <div class="receipt-info-row">
        <span>Receipt #:</span>
        <span>${data.receiptNumber}</span>
      </div>
      ${data.transactionId ? `
      <div class="receipt-info-row">
        <span>Transaction ID:</span>
        <span>${data.transactionId}</span>
      </div>
      ` : ''}
      <div class="receipt-info-row">
        <span>Date:</span>
        <span>${data.date}</span>
      </div>
      <div class="receipt-info-row">
        <span>Time:</span>
        <span>${data.time}</span>
      </div>
      ${data.cashierName ? `
      <div class="receipt-info-row">
        <span>Cashier:</span>
        <span>${data.cashierName}</span>
      </div>
      ` : ''}
      ${data.customerName ? `
      <div class="receipt-info-row">
        <span>Customer:</span>
        <span>${data.customerName}</span>
      </div>
      ` : ''}
    </div>
    <div class="items">
      ${data.items.map(item => `
        <div class="item">
          <div class="item-header">
            <span class="item-name">${item.name}</span>
            <span>$${item.total.toFixed(2)}</span>
          </div>
          <div class="item-details">
            <span>${item.quantity} x $${item.price.toFixed(2)}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${data.subtotal.toFixed(2)}</span>
      </div>
      ${data.discount ? `
      <div class="total-row">
        <span>Discount:</span>
        <span>-$${data.discount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${data.tax !== undefined ? `
      <div class="total-row">
        <span>Tax:</span>
        <span>$${data.tax.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>$${data.total.toFixed(2)}</span>
      </div>
    </div>
    <div class="payment">
      <div class="total-row">
        <span>Payment Method:</span>
        <span>${data.paymentMethod}</span>
      </div>
      ${data.paymentAmount ? `
      <div class="total-row">
        <span>Paid:</span>
        <span>$${data.paymentAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${data.changeAmount ? `
      <div class="total-row">
        <span>Change:</span>
        <span>$${data.changeAmount.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>
    ${data.footer ? `
    <div class="footer">
      ${data.footer}
    </div>
    ` : ''}
    ${data.notes ? `
    <div class="notes">
      ${data.notes}
    </div>
    ` : ''}
    ${data.qrcode ? `
    <div class="qrcode-container">
      <div id="qrcode"></div>
    </div>
    <script>
      (function() {
        var generated = false;
        function generateQR() {
          if (generated) return;
          if (typeof QRCode !== 'undefined') {
            var qrcodeEl = document.getElementById("qrcode");
            if (qrcodeEl && qrcodeEl.innerHTML === '') {
              new QRCode(qrcodeEl, {
                text: "${data.qrcode}",
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
              });
              generated = true;
            }
          } else {
            setTimeout(generateQR, 100);
          }
        }
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', generateQR);
        } else {
          generateQR();
        }
      })();
    </script>
    ` : ''}
  </div>
</body>
</html>
  `;
};
