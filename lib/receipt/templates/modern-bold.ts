import { ReceiptData } from '@/lib/receipt';

export const generateModernBoldTemplate = (data: ReceiptData): string => {
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
      padding: 15px;
      border: none;
    }
    .header {
      text-align: center;
      padding: 15px;
      margin-bottom: 20px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-number {
      font-size: 32px;
      font-weight: bold;
      line-height: 1;
    }
    .store-info {
      font-size: 11px;
      color: #666;
      line-height: 1.4;
      margin-top: 10px;
    }
    .receipt-info {
      font-size: 11px;
      margin-bottom: 15px;
      padding: 10px 0;
      border-top: 2px dashed #000;
      border-bottom: 2px dashed #000;
    }
    .receipt-info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .items-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 13px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px dashed #000;
    }
    .items {
      margin-bottom: 15px;
    }
    .item {
      font-size: 13px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .item-left {
      flex: 1;
    }
    .item-qty {
      font-weight: bold;
      margin-right: 10px;
    }
    .item-price {
      font-weight: bold;
      min-width: 70px;
      text-align: right;
    }
    .items-sold {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
    }
    .totals {
      font-size: 13px;
      border-top: 2px dashed #000;
      padding-top: 15px;
      margin-bottom: 15px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .total-row.subtotal {
      font-size: 16px;
      font-weight: bold;
      padding-bottom: 8px;
      margin-bottom: 8px;
      border-bottom: 1px dashed #000;
    }
    .total-row.grand-total {
      font-size: 22px;
      font-weight: bold;
      margin: 15px 0;
    }
    .payment {
      font-size: 13px;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 2px dashed #000;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    .payment-row.tendered {
      font-weight: bold;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo-section">
        <div class="logo-number">${data.storeName}</div>
      </div>
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
    
    <div class="items-header">
      <span>Qty  Description</span>
      <span>Price</span>
    </div>
    
    <div class="items">
      ${data.items.map(item => `
        <div class="item">
          <div class="item-left">
            <span class="item-qty">${item.quantity}x</span>
            <span>${item.name}</span>
          </div>
          <div class="item-price">$${item.total.toFixed(2)}</div>
        </div>
      `).join('')}

    </div>
    
    <div class="items-sold">
      ${data.items.length}x Items Sold
    </div>
    
    <div class="totals">
      <div class="total-row subtotal">
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
        <span>Total:</span>
        <span>$${data.total.toFixed(2)}</span>
      </div>
    </div>
    
    <div class="payment">
      <div class="payment-row">
        <span>${data.paymentMethod}:</span>
        <span>$${data.total.toFixed(2)}</span>
      </div>
      ${data.paymentAmount ? `
      <div class="payment-row tendered">
        <span>Tendered:</span>
        <span>$${data.paymentAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${data.changeAmount ? `
      <div class="payment-row">
        <span>Change:</span>
        <span>$${data.changeAmount.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>
    
    ${data.footer ? `
    <div class="footer">
      <div style="font-size: 11px; color: #666;">${data.footer}</div>
    </div>
    ` : ''}
    
    ${data.notes ? `
    <div style="text-align: center; font-size: 10px; font-style: italic; margin-top: 10px; color: #999;">
      ${data.notes}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
};