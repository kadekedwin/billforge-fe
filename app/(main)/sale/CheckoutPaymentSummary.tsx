"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { CartSummaryData } from "./cartUtils";
import { useBusiness } from "@/contexts/business-context";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CheckoutPaymentSummaryProps {
    summary: CartSummaryData;
    isSubmitting: boolean;
    onComplete: () => void;
}

export function CheckoutPaymentSummary({
    summary,
    isSubmitting,
    onComplete,
}: CheckoutPaymentSummaryProps) {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const currencySymbol = getCurrencySymbol(selectedBusiness?.currency);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('app.sale.paymentSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between">
                    <span>{t('app.sale.subtotal')}</span>
                    <span className="font-medium">{currencySymbol}{summary.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>{t('app.sale.tax')}</span>
                    <span className="font-medium">{currencySymbol}{summary.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>{t('app.sale.discount')}</span>
                    <span className="font-medium text-green-600">
                        -{currencySymbol}{summary.discountAmount.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>{t('app.sale.total')}</span>
                    <span className="text-primary">{currencySymbol}{summary.finalAmount.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={onComplete}
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('app.sale.processing')}
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {t('app.sale.completeTransaction')}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}