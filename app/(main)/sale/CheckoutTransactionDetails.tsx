"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {Customer, PaymentMethod} from "@/lib/api";

interface CheckoutTransactionDetailsProps {
    customers: Customer[];
    paymentMethods: PaymentMethod[];
    selectedCustomer: string;
    selectedPaymentMethod: string;
    notes: string;
    isSubmitting: boolean;
    onCustomerChange: (value: string) => void;
    onPaymentMethodChange: (value: string) => void;
    onNotesChange: (value: string) => void;
}

export function CheckoutTransactionDetails({
                                               customers,
                                               paymentMethods,
                                               selectedCustomer,
                                               selectedPaymentMethod,
                                               notes,
                                               isSubmitting,
                                               onCustomerChange,
                                               onPaymentMethodChange,
                                               onNotesChange,
                                           }: CheckoutTransactionDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="customer">Customer (Optional)</Label>
                    <select
                        id="customer"
                        value={selectedCustomer}
                        onChange={(e) => onCustomerChange(e.target.value)}
                        disabled={isSubmitting}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Select customer...</option>
                        {customers.map((customer) => (
                            <option key={customer.uuid} value={customer.uuid}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
                    <select
                        id="paymentMethod"
                        value={selectedPaymentMethod}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                        disabled={isSubmitting}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Select payment method...</option>
                        {paymentMethods.map((method) => (
                            <option key={method.uuid} value={method.uuid}>
                                {method.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Add any notes about this transaction..."
                        rows={3}
                    />
                </div>
            </CardContent>
        </Card>
    );
}