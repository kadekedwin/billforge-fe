"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Item, Customer, PaymentMethod, ItemTax, ItemDiscount } from "@/lib/api";
import { CheckoutOrderSummary } from "./CheckoutOrderSummary";
import { CheckoutTransactionDetails } from "./CheckoutTransactionDetails";
import { CheckoutPaymentSummary } from "./CheckoutPaymentSummary";
import { calculateCartSummary } from "./cartUtils";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CheckoutViewProps {
    cart: Map<string, number>;
    items: Item[];
    customers: Customer[];
    paymentMethods: PaymentMethod[];
    taxes: ItemTax[];
    discounts: ItemDiscount[];
    selectedCustomer: string;
    selectedPaymentMethod: string;
    notes: string;
    isSubmitting: boolean;
    error: string | null;
    onBack: () => void;
    onCustomerChange: (value: string) => void;
    onPaymentMethodChange: (value: string) => void;
    onNotesChange: (value: string) => void;
    onComplete: () => void;
}

export function CheckoutView({
    cart,
    items,
    customers,
    paymentMethods,
    taxes,
    discounts,
    selectedCustomer,
    selectedPaymentMethod,
    notes,
    isSubmitting,
    error,
    onBack,
    onCustomerChange,
    onPaymentMethodChange,
    onNotesChange,
    onComplete,
}: CheckoutViewProps) {
    const { t } = useTranslation();
    const summary = calculateCartSummary(cart, items, taxes, discounts);

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('app.sale.backToItems')}
                </Button>
                <h1 className="text-3xl font-bold">{t('app.sale.checkout')}</h1>
                <p className="text-muted-foreground">
                    {t('app.sale.reviewOrder')}
                </p>
            </div>

            {error && (
                <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <CheckoutOrderSummary
                    cart={cart}
                    items={items}
                    taxes={taxes}
                    discounts={discounts}
                />

                <CheckoutTransactionDetails
                    customers={customers}
                    paymentMethods={paymentMethods}
                    selectedCustomer={selectedCustomer}
                    selectedPaymentMethod={selectedPaymentMethod}
                    notes={notes}
                    isSubmitting={isSubmitting}
                    onCustomerChange={onCustomerChange}
                    onPaymentMethodChange={onPaymentMethodChange}
                    onNotesChange={onNotesChange}
                />

                <CheckoutPaymentSummary
                    summary={summary}
                    isSubmitting={isSubmitting}
                    onComplete={onComplete}
                />
            </div>
        </div>
    );
}