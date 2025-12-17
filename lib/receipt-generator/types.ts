export interface ReceiptItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface ReceiptData {
    receiptNumber: string;
    transactionId?: string;
    date: string;
    time: string;
    cashierName?: string;
    customerName?: string;
    storeName: string;
    storeAddress?: string;
    storePhone?: string;
    storeLogo?: string;
    items: ReceiptItem[];
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    paymentMethod: string;
    paymentAmount?: number;
    changeAmount?: number;
    footer?: string;
    qrcode?: string;
    notes?: string;
    currencySymbol?: string;
}

export type ReceiptTemplateType = 'classic' | 'sans-serif' | 'modern-bold';

export interface ReceiptTemplate {
    name: string;
    type: ReceiptTemplateType;
    description: string;
    generateHTML: (data: ReceiptData) => string;
}