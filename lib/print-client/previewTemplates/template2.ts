import { ReceiptData } from "@/lib/receipt-generator";

export const generatePreviewTemplate2 = (data: ReceiptData): string => {
  const currency = data.currencySymbol || '$';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
    .receipt { max-width: 80mm; margin: 0; background: white; padding: 10px; border: none; }
    .center { text-align: center; }
    .logo { width: 100%; height: auto; margin-bottom: 10px; }
    .store-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
    .store-info { font-size: 11px; margin-bottom: 5px; }
    .separator { border-bottom: 2px dashed #000; margin: 10px 0; }
    .thin-separator { border-bottom: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; width: 100%; }
    .item { margin-bottom: 10px; }
    .item-name { font-weight: bold; font-size: 12px; }
    .item-details { font-size: 11px; color: #666; margin-top: 2px; }
    .total { font-size: 12px; font-weight: bold; margin-top: 8px; }
    .footer { font-size: 10px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      ${data.storeLogo ? `<img src="${data.storeLogo}" class="logo" />` : ''}
      <div class="store-name">${data.storeName}</div>
      ${data.storeAddress ? `<div class="store-info">${data.storeAddress}</div>` : ''}
      ${data.storePhone ? `<div class="store-info">${data.storePhone}</div>` : ''}
    </div>
    <div class="separator"></div>
    <div class="row"><span>Receipt #:</span><span>${data.receiptNumber}</span></div>
    ${data.transactionId ? `<div class="row"><span>Transaction ID:</span><span>${data.transactionId}</span></div>` : ''}
    <div class="row"><span>Date:</span><span>${data.date}</span></div>
    <div class="row"><span>Time:</span><span>${data.time}</span></div>
    ${data.cashierName ? `<div class="row"><span>Cashier:</span><span>${data.cashierName}</span></div>` : ''}
    ${data.customerName ? `<div class="row"><span>Customer:</span><span>${data.customerName}</span></div>` : ''}
    <div class="separator"></div>
    ${data.items.map(item => `
      <div class="item">
        <div class="row">
          <span class="item-name">${item.name}</span>
          <span class="item-name">${currency}${item.total.toFixed(2)}</span>
        </div>
        <div class="item-details" style="padding-left: 10px;">${item.quantity} x ${currency}${item.price.toFixed(2)}</div>
      </div>
    `).join('')}
    <div class="separator"></div>
    <div class="row"><span>Subtotal:</span><span>${currency}${data.subtotal.toFixed(2)}</span></div>
    ${data.discount ? `<div class="row"><span>Discount:</span><span>-${currency}${data.discount.toFixed(2)}</span></div>` : ''}
    ${data.tax !== undefined ? `<div class="row"><span>Tax:</span><span>${currency}${data.tax.toFixed(2)}</span></div>` : ''}
    <div class="row total"><span>TOTAL:</span><span>${currency}${data.total.toFixed(2)}</span></div>
    <div class="thin-separator"></div>
    <div class="row"><span>Payment Method:</span><span>${data.paymentMethod}</span></div>
    ${data.paymentAmount ? `<div class="row"><span>Paid:</span><span>${currency}${data.paymentAmount.toFixed(2)}</span></div>` : ''}
    ${data.changeAmount ? `<div class="row"><span>Change:</span><span>${currency}${data.changeAmount.toFixed(2)}</span></div>` : ''}
    ${data.footer ? `<div class="center footer">${data.footer}</div>` : ''}
    ${data.notes ? `<div class="center" style="margin-top: 10px; font-size: 10px; color: #666;">${data.notes}</div>` : ''}
    ${data.qrcode ? `<div class="center" style="margin-top: 10px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.qrcode)}" alt="QR Code" style="width: 150px; height: 150px;" /></div>` : ''}
  </div>
</body>
</html>
  `;
};
