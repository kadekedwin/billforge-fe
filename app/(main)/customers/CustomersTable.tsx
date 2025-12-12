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
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import type { Customer } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface CustomersTableProps {
    customers: Customer[];
    isLoading: boolean;
    deletingId: number | null;
    onEdit: (customer: Customer) => void;
    onDelete: (customer: Customer) => void;
    onAddFirst: () => void;
}

export function CustomersTable({
    customers,
    isLoading,
    deletingId,
    onEdit,
    onDelete,
    onAddFirst,
}: CustomersTableProps) {
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

    if (customers.length === 0) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 flex-col items-center justify-center space-y-4">
                    <p className="text-lg text-muted-foreground">{t('app.customers.noCustomers')}</p>
                    <Button onClick={onAddFirst}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('app.customers.addFirstCustomer')}
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
                        <TableHead>{t('app.customers.name')}</TableHead>
                        <TableHead>{t('app.customers.email')}</TableHead>
                        <TableHead>{t('app.customers.phone')}</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">{t('app.customers.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.email || "-"}</TableCell>
                            <TableCell>{customer.phone || "-"}</TableCell>
                            <TableCell>
                                {new Date(customer.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(customer)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(customer)}
                                        disabled={deletingId === customer.id}
                                    >
                                        {deletingId === customer.id ? (
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