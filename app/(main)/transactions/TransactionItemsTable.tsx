"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import type { TransactionItem } from "@/lib/api";
import { useBusiness } from "@/contexts/business-context";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface TransactionItemsTableProps {
    items: TransactionItem[];
    isLoading: boolean;
}

export function TransactionItemsTable({ items, isLoading }: TransactionItemsTableProps) {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const currencySymbol = getCurrencySymbol(selectedBusiness?.currency);

    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">{t('app.transactions.noItems')}</p>;
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('app.transactions.item')}</TableHead>
                        <TableHead>{t('app.transactions.quantity')}</TableHead>
                        <TableHead>{t('app.transactions.basePrice')}</TableHead>
                        <TableHead>{t('app.transactions.tax')}</TableHead>
                        <TableHead>{t('app.transactions.discount')}</TableHead>
                        <TableHead>{t('app.transactions.total')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <div className="font-medium">{item.name}</div>
                                {item.sku && (
                                    <div className="text-xs text-muted-foreground">
                                        SKU: {item.sku}
                                    </div>
                                )}
                                {item.description && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {item.description}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{currencySymbol}{parseFloat(item.base_price).toFixed(2)}</TableCell>
                            <TableCell>{currencySymbol}{parseFloat(item.tax_amount).toFixed(2)}</TableCell>
                            <TableCell>-{currencySymbol}{parseFloat(item.discount_amount).toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">
                                {currencySymbol}{parseFloat(item.total_price).toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}