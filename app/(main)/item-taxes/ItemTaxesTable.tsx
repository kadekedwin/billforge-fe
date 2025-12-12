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
import type { ItemTax } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ItemTaxesTableProps {
    taxes: ItemTax[];
    isLoading: boolean;
    deletingId: number | null;
    onEdit: (tax: ItemTax) => void;
    onDelete: (tax: ItemTax) => void;
}

export function ItemTaxesTable({
    taxes,
    isLoading,
    deletingId,
    onEdit,
    onDelete,
}: ItemTaxesTableProps) {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (taxes.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">{t('app.itemTaxes.noTaxes')}</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableRow>
                            <TableHead>{t('app.itemTaxes.name')}</TableHead>
                            <TableHead>{t('app.itemTaxes.type')}</TableHead>
                            <TableHead>{t('app.itemTaxes.value')}</TableHead>
                            <TableHead className="text-right">{t('app.itemTaxes.actions')}</TableHead>
                        </TableRow>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {taxes.map((tax) => (
                        <TableRow key={tax.id}>
                            <TableCell>{tax.name}</TableCell>
                            <TableCell>
                                <Badge variant={tax.type === "percentage" ? "default" : "secondary"}>
                                    {tax.type === "percentage" ? t('app.itemTaxes.percentage') : t('app.itemTaxes.fixed')}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {tax.type === "percentage" ? `${tax.value}%` : `$${tax.value}`}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(tax)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(tax)}
                                        disabled={deletingId === tax.id}
                                    >
                                        {deletingId === tax.id ? (
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