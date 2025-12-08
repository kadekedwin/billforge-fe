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

interface TransactionItemsTableProps {
    items: TransactionItem[];
    isLoading: boolean;
}

export function TransactionItemsTable({ items, isLoading }: TransactionItemsTableProps) {
    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">No items found</p>;
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Total</TableHead>
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
                            <TableCell>${parseFloat(item.base_price).toFixed(2)}</TableCell>
                            <TableCell>${parseFloat(item.tax_amount).toFixed(2)}</TableCell>
                            <TableCell>-${parseFloat(item.discount_amount).toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">
                                ${parseFloat(item.total_price).toFixed(2)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}