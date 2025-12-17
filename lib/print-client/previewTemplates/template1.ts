import { ReceiptData } from "@/lib/receipt-generator";

export const generatePreviewTemplate1 = (data: ReceiptData): string => {
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
    .bold { font-weight: bold; }
    .store-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
    .store-info { font-size: 10px; margin-bottom: 8px; }
    .separator { border-bottom: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
    .item-row { font-size: 11px; margin-bottom: 5px; }
    .total { font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      <div class="store-name">${data.storeName}</div>
      ${data.storePhone ? `<div class="store-info">${data.storePhone}</div>` : ''}
      <div class="store-info">${data.date} ${data.time}</div>
    </div>
    <div class="separator"></div>
    ${data.items.map(item => `
      <div class="item-row">
        ${item.quantity}x ${item.name} <span style="float: right;">${currency}${item.total.toFixed(2)}</span>
      </div>
    `).join('')}
    <div class="separator"></div>
    <div class="row"><span>Subtotal:</span><span>${currency}${data.subtotal.toFixed(2)}</span></div>
    ${data.discount ? `<div class="row"><span>Discount:</span><span>-${currency}${data.discount.toFixed(2)}</span></div>` : ''}
    <div class="row total"><span>TOTAL:</span><span>${currency}${data.total.toFixed(2)}</span></div>
    <div class="center" style="margin-top: 10px; font-size: 10px;">Thank You!</div>
  </div>
</body>
</html>
  `;
};
