"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Item, ItemTax, ItemDiscount } from "@/lib/api";
import { calculateItemTax, calculateItemDiscount } from "./cartUtils";
import { useBusiness } from "@/contexts/business-context";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CheckoutOrderSummaryProps {
    cart: Map<string, number>;
    items: Item[];
    taxes: ItemTax[];
    discounts: ItemDiscount[];
}

export function CheckoutOrderSummary({
    cart,
    items,
    taxes,
    discounts,
}: CheckoutOrderSummaryProps) {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const currencySymbol = getCurrencySymbol(selectedBusiness?.currency);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('app.sale.orderSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('app.sale.item')}</TableHead>
                            <TableHead>{t('app.sale.quantity')}</TableHead>
                            <TableHead>{t('app.sale.price')}</TableHead>
                            <TableHead>{t('app.sale.tax')}</TableHead>
                            <TableHead>{t('app.sale.discount')}</TableHead>
                            <TableHead className="text-right">{t('app.sale.total')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from(cart.entries()).map(([itemUuid, qty]) => {
                            const item = items.find((i) => i.uuid === itemUuid);
                            if (!item) return null;
                            const basePrice = parseFloat(item.base_price) * qty;
                            const tax = calculateItemTax(item, basePrice, taxes);
                            const discount = calculateItemDiscount(item, basePrice, discounts);
                            const total = basePrice + tax - discount;
                            return (
                                <TableRow key={itemUuid}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{qty}</TableCell>
                                    <TableCell>{currencySymbol}{basePrice.toFixed(2)}</TableCell>
                                    <TableCell>{currencySymbol}{tax.toFixed(2)}</TableCell>
                                    <TableCell>-{currencySymbol}{discount.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-semibold">
                                        {currencySymbol}{total.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}