export interface ReceiptItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface ReceiptData {
    receiptNumber: string;
    date: string;
    time: string;
    cashierName?: string;
    customerName?: string;
    storeName: string;
    storeAddress?: string;
    storePhone?: string;
    items: ReceiptItem[];
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    paymentMethod: string;
    paymentAmount?: number;
    changeAmount?: number;
    footer?: string;
    notes?: string;
}

export interface ReceiptTemplate {
    width: number;
    height: number;
    padding: number;
    fontSizes: {
        title: number;
        header: number;
        body: number;
        small: number;
    };
    colors: {
        primary: string;
        secondary: string;
        text: string;
        border: string;
    };
}