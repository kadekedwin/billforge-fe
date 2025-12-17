"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { ItemDiscount } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ItemDiscountsTableProps {
    discounts: ItemDiscount[];
    isLoading: boolean;
    deletingId: number | null;
    onEdit: (discount: ItemDiscount) => void;
    onDelete: (discount: ItemDiscount) => void;
}

export function ItemDiscountsTable({
    discounts,
    isLoading,
    deletingId,
    onEdit,
    onDelete,
}: ItemDiscountsTableProps) {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (discounts.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">{t('app.itemDiscounts.noDiscounts')}</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('app.itemDiscounts.name')}</TableHead>
                        <TableHead>{t('app.itemDiscounts.type')}</TableHead>
                        <TableHead>{t('app.itemDiscounts.value')}</TableHead>
                        <TableHead className="text-right">{t('app.itemDiscounts.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {discounts.map((discount) => (
                        <TableRow key={discount.id}>
                            <TableCell>{discount.name}</TableCell>
                            <TableCell>
                                <Badge variant={discount.type === "percentage" ? "default" : "secondary"}>
                                    {discount.type === "percentage" ? t('app.itemDiscounts.percentage') : t('app.itemDiscounts.fixed')}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(discount)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(discount)}
                                        disabled={deletingId === discount.id}
                                    >
                                        {deletingId === discount.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}