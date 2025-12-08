import type { Customer, PaymentMethod } from "@/lib/api";

export function getCustomerName(
    customerUuid: string | null,
    customers: Customer[]
): string {
    if (!customerUuid) return "-";
    const customer = customers.find(c => c.uuid === customerUuid);
    return customer?.name || "Unknown Customer";
}

export function getPaymentMethodName(
    paymentMethodUuid: string | null,
    paymentMethods: PaymentMethod[]
): string {
    if (!paymentMethodUuid) return "-";
    const paymentMethod = paymentMethods.find(pm => pm.uuid === paymentMethodUuid);
    return paymentMethod?.name || "Unknown Method";
}

export function getCustomer(
    customerUuid: string | null,
    customers: Customer[]
): Customer | null {
    if (!customerUuid) return null;
    return customers.find(c => c.uuid === customerUuid) || null;
}

export function openWhatsApp(phoneNumber: string, message: string): void {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
}