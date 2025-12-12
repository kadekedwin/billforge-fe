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
import { Eye, Loader2 } from "lucide-react";
import type { Transaction } from "@/lib/api";
import { useBusiness } from "@/contexts/business-context";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface TransactionsTableProps {
    transactions: Transaction[];
    isLoading: boolean;
    onViewDetails: (transaction: Transaction) => void;
    getCustomerName: (customerUuid: string | null) => string;
    getPaymentMethodName: (paymentMethodUuid: string | null) => string;
}

export function TransactionsTable({
    transactions,
    isLoading,
    onViewDetails,
    getCustomerName,
    getPaymentMethodName,
}: TransactionsTableProps) {
    const { selectedBusiness } = useBusiness();
    const currencySymbol = getCurrencySymbol(selectedBusiness?.currency);

    if (isLoading) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 flex-col items-center justify-center space-y-4">
                    <p className="text-lg text-muted-foreground">No transactions found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Final Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                {new Date(transaction.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>{getCustomerName(transaction.customer_uuid)}</TableCell>
                            <TableCell>{getPaymentMethodName(transaction.payment_method_uuid)}</TableCell>
                            <TableCell>{currencySymbol}{parseFloat(transaction.total_amount).toFixed(2)}</TableCell>
                            <TableCell className="font-semibold">
                                {currencySymbol}{parseFloat(transaction.final_amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onViewDetails(transaction)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}