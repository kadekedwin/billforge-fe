import { ReceiptData, ReceiptItem } from './types';

export const generateReceiptNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `RCP-${year}${month}${day}-${random}`;
};

export const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
};

export const formatDate = (date: Date = new Date()): string => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatTime = (date: Date = new Date()): string => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

interface TransactionItem {
    uuid: string;
    name: string;
    quantity: number;
    base_price: string;
    total_price: string;
}

interface Transaction {
    created_at: string;
    total_amount: string;
    tax_amount: string;
    discount_amount: string;
    final_amount: string;
    customer_uuid: string | null;
    payment_method_uuid: string | null;
    notes: string | null;
}

interface Business {
    name: string;
    address: string | null;
    phone: string | null;
}

interface Customer {
    name: string;
}

export const convertTransactionToReceiptData = (
    transaction: Transaction,
    items: TransactionItem[],
    business: Business | null,
    customerName?: string,
    paymentMethodName?: string,
    footer?: string,
): ReceiptData => {
    const receiptItems: ReceiptItem[] = items.map(item => ({
        id: item.uuid,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.base_price),
        total: parseFloat(item.total_price),
    }));

    const transactionDate = new Date(transaction.created_at);

    return {
        receiptNumber: generateReceiptNumber(),
        date: formatDate(transactionDate),
        time: formatTime(transactionDate),
        customerName: customerName || undefined,
        storeName: business?.name || "Store",
        storeAddress: business?.address || undefined,
        storePhone: business?.phone || undefined,
        items: receiptItems,
        subtotal: parseFloat(transaction.total_amount),
        tax: parseFloat(transaction.tax_amount),
        discount: parseFloat(transaction.discount_amount),
        total: parseFloat(transaction.final_amount),
        paymentMethod: paymentMethodName || "Cash",
        footer: footer,
        notes: transaction.notes || undefined,
    };
};
