import { createTransaction } from "@/lib/api/transactions";
import { createTransactionItem } from "@/lib/api/transaction-items";
import { getReceiptData, updateReceiptData } from "@/lib/api/receipt-data";
import type { Item, Customer, PaymentMethod, ItemTax, ItemDiscount, Transaction, TransactionItem } from "@/lib/api";
import { calculateItemTax, calculateItemDiscount, calculateCartSummary } from "./cartUtils";

export interface CompleteTransactionParams {
    cart: Map<string, number>;
    items: Item[];
    taxes: ItemTax[];
    discounts: ItemDiscount[];
    businessUuid: string;
    selectedCustomer: string;
    selectedPaymentMethod: string;
    notes: string;
    customers: Customer[];
    paymentMethods: PaymentMethod[];
}

export interface CompleteTransactionResult {
    success: boolean;
    transaction?: Transaction;
    transactionItems?: TransactionItem[];
    customerName?: string;
    paymentMethodName?: string;
    customerEmail?: string | null;
    customerPhone?: string | null;
    error?: string;
}

export async function completeTransaction({
    cart,
    items,
    taxes,
    discounts,
    businessUuid,
    selectedCustomer,
    selectedPaymentMethod,
    notes,
    customers,
    paymentMethods,
}: CompleteTransactionParams): Promise<CompleteTransactionResult> {
    try {
        const summary = calculateCartSummary(cart, items, taxes, discounts);

        let transactionId: string | null = null;
        let receiptData: { transaction_prefix: string | null; transaction_next_number: number } | null = null;

        try {
            const receiptResponse = await getReceiptData(businessUuid);
            if (receiptResponse.success && receiptResponse.data) {
                receiptData = receiptResponse.data;
                const prefix = receiptData?.transaction_prefix || '';
                const number = receiptData?.transaction_next_number || 1;
                transactionId = `${prefix}${number}`;
            }
        } catch (err) {
            console.error('Error fetching receipt data for transaction ID:', err);
        }

        const transactionData = {
            business_uuid: businessUuid,
            customer_uuid: selectedCustomer || null,
            payment_method_uuid: selectedPaymentMethod || null,
            total_amount: summary.totalAmount,
            tax_amount: summary.taxAmount,
            discount_amount: summary.discountAmount,
            final_amount: summary.finalAmount,
            notes: notes || null,
            transaction_id: transactionId,
        };

        const transactionResponse = await createTransaction(transactionData);

        if (!transactionResponse.success) {
            const errorData = transactionResponse as unknown as {
                success: false;
                message: string;
            };
            return {
                success: false,
                error: errorData.message || "Failed to create transaction",
            };
        }

        const transaction = transactionResponse.data;
        const createdItems: TransactionItem[] = [];

        for (const [itemUuid, qty] of cart.entries()) {
            const item = items.find((i) => i.uuid === itemUuid);
            if (item) {
                const basePrice = parseFloat(item.base_price) * qty;
                const taxAmount = calculateItemTax(item, basePrice, taxes);
                const discountAmount = calculateItemDiscount(item, basePrice, discounts);
                const totalPrice = basePrice + taxAmount - discountAmount;

                const itemData = {
                    transaction_uuid: transaction.uuid,
                    name: item.name,
                    sku: item.sku || null,
                    description: item.description || null,
                    quantity: qty,
                    base_price: basePrice,
                    tax_amount: taxAmount,
                    discount_amount: discountAmount,
                    total_price: totalPrice,
                };

                await createTransactionItem(itemData);

                createdItems.push({
                    id: 0,
                    uuid: `temp-${itemUuid}`,
                    transaction_uuid: transaction.uuid,
                    name: item.name,
                    sku: item.sku || null,
                    description: item.description || null,
                    quantity: qty,
                    base_price: basePrice.toString(),
                    tax_amount: taxAmount.toString(),
                    discount_amount: discountAmount.toString(),
                    total_price: totalPrice.toString(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
            }
        }

        // Update receipt data transaction number after successful transaction
        if (receiptData && receiptData.transaction_next_number !== undefined) {
            try {
                await updateReceiptData(businessUuid, {
                    transaction_next_number: receiptData.transaction_next_number + 1
                });
            } catch (err) {
                console.error('Error updating receipt data transaction number:', err);
            }
        }

        const customerData = selectedCustomer ? customers.find(c => c.uuid === selectedCustomer) : null;
        const paymentMethodData = selectedPaymentMethod ? paymentMethods.find(pm => pm.uuid === selectedPaymentMethod) : null;

        return {
            success: true,
            transaction,
            transactionItems: createdItems,
            customerName: customerData?.name,
            paymentMethodName: paymentMethodData?.name || "Cash",
            customerEmail: customerData?.email || null,
            customerPhone: customerData?.phone || null,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "An error occurred while completing the transaction",
        };
    }
}