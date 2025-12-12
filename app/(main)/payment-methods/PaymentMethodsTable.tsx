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
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import type { PaymentMethod } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface PaymentMethodsTableProps {
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    deletingId: number | null;
    onEdit: (paymentMethod: PaymentMethod) => void;
    onDelete: (paymentMethod: PaymentMethod) => void;
    onAddFirst: () => void;
}

export function PaymentMethodsTable({
    paymentMethods,
    isLoading,
    deletingId,
    onEdit,
    onDelete,
    onAddFirst,
}: PaymentMethodsTableProps) {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (paymentMethods.length === 0) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 flex-col items-center justify-center space-y-4">
                    <p className="text-lg text-muted-foreground">{t('app.paymentMethods.noMethods')}</p>
                    <Button onClick={onAddFirst}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('app.paymentMethods.addFirstMethod')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('app.paymentMethods.title')}</TableHead>
                        <TableHead>{t('app.paymentMethods.created')}</TableHead>
                        <TableHead className="text-right">{t('app.paymentMethods.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paymentMethods.map((paymentMethod) => (
                        <TableRow key={paymentMethod.id}>
                            <TableCell>
                                <Badge variant="outline">{paymentMethod.name}</Badge>
                            </TableCell>
                            <TableCell>
                                {new Date(paymentMethod.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(paymentMethod)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(paymentMethod)}
                                        disabled={deletingId === paymentMethod.id}
                                    >
                                        {deletingId === paymentMethod.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 text-destructive" />
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