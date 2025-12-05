"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Loader2 } from "lucide-react";
import { getTransactions } from "@/lib/api/transactions";
import { getBusinesses } from "@/lib/api/businesses";
import { getCustomers } from "@/lib/api/customers";
import { getPaymentMethods } from "@/lib/api/payment-methods";
import { getTransactionItems } from "@/lib/api/transaction-items";
import { getItems } from "@/lib/api/items";
import type { Transaction, Business, Customer, PaymentMethod, TransactionItem, Item } from "@/lib/api";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [
                transactionsResponse,
                businessesResponse,
                customersResponse,
                paymentMethodsResponse,
                itemsResponse,
            ] = await Promise.all([
                getTransactions(),
                getBusinesses(),
                getCustomers(),
                getPaymentMethods(),
                getItems(),
            ]);

            if (transactionsResponse.success) {
                setTransactions(transactionsResponse.data);
            } else {
                const errorData = transactionsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load transactions");
            }

            if (businessesResponse.success) {
                setBusinesses(businessesResponse.data);
            }

            if (customersResponse.success) {
                setCustomers(customersResponse.data);
            }

            if (paymentMethodsResponse.success) {
                setPaymentMethods(paymentMethodsResponse.data);
            }

            if (itemsResponse.success) {
                setItems(itemsResponse.data);
            }
        } catch (err) {
            setError("An error occurred while loading data");
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = async (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailsDialogOpen(true);
        setIsLoadingItems(true);

        try {
            const response = await getTransactionItems({ transaction_uuid: transaction.uuid });
            if (response.success) {
                setTransactionItems(response.data);
            }
        } catch (err) {
            console.error("Error loading transaction items:", err);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const getBusinessName = (business_uuid: string) => {
        const business = businesses.find(b => b.uuid === business_uuid);
        return business?.name || "Unknown Business";
    };

    const getCustomerName = (customer_uuid: string | null) => {
        if (!customer_uuid) return "-";
        const customer = customers.find(c => c.uuid === customer_uuid);
        return customer?.name || "Unknown Customer";
    };

    const getPaymentMethodName = (payment_method_uuid: string | null) => {
        if (!payment_method_uuid) return "-";
        const paymentMethod = paymentMethods.find(pm => pm.uuid === payment_method_uuid);
        return paymentMethod?.name || "Unknown Method";
    };

    const getItemName = (item_uuid: string) => {
        const item = items.find(i => i.uuid === item_uuid);
        return item?.name || "Unknown Item";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "paid":
                return <Badge variant="default" className="bg-green-500">Paid</Badge>;
            case "pending":
                return <Badge variant="secondary">Pending</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">
                        View all transaction history
                    </p>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="rounded-lg border bg-card">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4">
                        <p className="text-lg text-muted-foreground">No transactions found</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Final Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {new Date(transaction.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getBusinessName(transaction.business_uuid)}</TableCell>
                                    <TableCell>{getCustomerName(transaction.customer_uuid)}</TableCell>
                                    <TableCell>{getPaymentMethodName(transaction.payment_method_uuid)}</TableCell>
                                    <TableCell>${parseFloat(transaction.total_amount).toFixed(2)}</TableCell>
                                    <TableCell className="font-semibold">
                                        ${parseFloat(transaction.final_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleViewDetails(transaction)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>
                            View complete transaction information
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Business</p>
                                    <p className="text-sm">{getBusinessName(selectedTransaction.business_uuid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                    <p className="text-sm">{getCustomerName(selectedTransaction.customer_uuid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                    <p className="text-sm">{getPaymentMethodName(selectedTransaction.payment_method_uuid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="text-sm">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                                    <p className="text-sm font-mono">{selectedTransaction.uuid}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Items</h3>
                                {isLoadingItems ? (
                                    <div className="flex h-32 items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : transactionItems.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No items found</p>
                                ) : (
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
                                                {transactionItems.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{getItemName(item.item_uuid)}</TableCell>
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
                                )}
                            </div>

                            <div className="space-y-2 rounded-lg bg-muted p-4">
                                <div className="flex justify-between">
                                    <span className="text-sm">Total Amount:</span>
                                    <span className="text-sm font-medium">
                                        ${parseFloat(selectedTransaction.total_amount).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Tax Amount:</span>
                                    <span className="text-sm font-medium">
                                        ${parseFloat(selectedTransaction.tax_amount).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Discount Amount:</span>
                                    <span className="text-sm font-medium text-green-600">
                                        -${parseFloat(selectedTransaction.discount_amount).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="font-semibold">Final Amount:</span>
                                    <span className="font-semibold text-lg">
                                        ${parseFloat(selectedTransaction.final_amount).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
