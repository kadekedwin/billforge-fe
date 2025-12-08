import type { Item, ItemTax, ItemDiscount, Transaction } from "@/lib/api";

export function calculateItemTax(
    item: Item,
    basePrice: number,
    taxes: ItemTax[]
): number {
    if (!item.tax_uuid) return 0;
    const tax = taxes.find((t) => t.uuid === item.tax_uuid);
    if (!tax) return 0;
    if (tax.type === "percentage") {
        return (basePrice * parseFloat(tax.value)) / 100;
    }
    return parseFloat(tax.value);
}

export function calculateItemDiscount(
    item: Item,
    basePrice: number,
    discounts: ItemDiscount[]
): number {
    if (!item.discount_uuid) return 0;
    const discount = discounts.find((d) => d.uuid === item.discount_uuid);
    if (!discount) return 0;
    if (discount.type === "percentage") {
        return (basePrice * parseFloat(discount.value)) / 100;
    }
    return parseFloat(discount.value);
}

export interface CartSummaryData {
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    finalAmount: number;
}

export function calculateCartSummary(
    cart: Map<string, number>,
    items: Item[],
    taxes: ItemTax[],
    discounts: ItemDiscount[]
): CartSummaryData {
    let totalAmount = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    cart.forEach((qty, itemUuid) => {
        const item = items.find((i) => i.uuid === itemUuid);
        if (item) {
            const basePrice = parseFloat(item.base_price) * qty;
            totalAmount += basePrice;
            taxAmount += calculateItemTax(item, basePrice, taxes);
            discountAmount += calculateItemDiscount(item, basePrice, discounts);
        }
    });

    const finalAmount = totalAmount + taxAmount - discountAmount;

    return { totalAmount, taxAmount, discountAmount, finalAmount };
}

export function getMonthlyTransactionCount(
    transactions: Transaction[],
    businessUuid: string
): number {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(transaction => {
        if (transaction.business_uuid !== businessUuid) return false;

        const transactionDate = new Date(transaction.created_at);
        return transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear;
    }).length;
}

export function getTotalCartItems(cart: Map<string, number>): number {
    return Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
}

export function getTotalCartAmount(cart: Map<string, number>, items: Item[]): number {
    let total = 0;
    cart.forEach((qty, itemUuid) => {
        const item = items.find((i) => i.uuid === itemUuid);
        if (item) {
            total += parseFloat(item.base_price) * qty;
        }
    });
    return total;
}