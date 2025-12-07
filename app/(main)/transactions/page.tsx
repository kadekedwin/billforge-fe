"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Eye, Loader2, Download, Mail, MessageCircle } from "lucide-react";
import { getTransactions } from "@/lib/api/transactions";
import { getCustomers } from "@/lib/api/customers";
import { getPaymentMethods } from "@/lib/api/payment-methods";
import { getTransactionItems } from "@/lib/api/transaction-items";
import { useBusiness } from "@/contexts/business-context";
import type { Transaction, Customer, PaymentMethod, TransactionItem } from "@/lib/api";
import {useReceiptGenerator} from "@/lib/receipt/useReceiptGenerator";
import {convertTransactionToReceiptData} from "@/lib/receipt";

export default function TransactionsPage() {
    const { selectedBusiness } = useBusiness();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionItems, setTransactionItems] = useState<TransactionItem[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
    const { generatePDF, loading: receiptLoading } = useReceiptGenerator();

    const loadData = useCallback(async () => {
        if (!selectedBusiness) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const [
                transactionsResponse,
                customersResponse,
                paymentMethodsResponse,
            ] = await Promise.all([
                getTransactions(),
                getCustomers(),
                getPaymentMethods(),
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

            if (customersResponse.success) {
                setCustomers(customersResponse.data);
            }

            if (paymentMethodsResponse.success) {
                setPaymentMethods(paymentMethodsResponse.data);
            }
        } catch (err) {
            setError("An error occurred while loading data");
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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

    const getCustomer = (customer_uuid: string | null) => {
        if (!customer_uuid) return null;
        return customers.find(c => c.uuid === customer_uuid);
    };

    const handleDownloadReceipt = async () => {
        if (!selectedTransaction || !selectedBusiness) return;

        try {
            const customer = getCustomer(selectedTransaction.customer_uuid);
            const paymentMethodName = selectedTransaction.payment_method_uuid
                ? getPaymentMethodName(selectedTransaction.payment_method_uuid)
                : "Cash";

            const receiptData = convertTransactionToReceiptData(
                selectedTransaction,
                transactionItems,
                selectedBusiness,
                customer?.name,
                paymentMethodName
            );

            await generatePDF(receiptData);
        } catch (err) {
            console.error("Error generating receipt:", err);
            alert("Failed to generate receipt");
        }
    };

    const handleSendEmail = async () => {
        if (!selectedTransaction) return;

        const customer = getCustomer(selectedTransaction.customer_uuid);
        if (!customer?.email) return;

        try {
            setIsSendingEmail(true);
            // TODO: Implement email sending functionality
            console.log("Send receipt to email:", customer.email);
            alert(`Receipt will be sent to ${customer.email}`);
        } catch (err) {
            console.error("Error sending email:", err);
            alert("Failed to send email");
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleSendWhatsApp = async () => {
        if (!selectedTransaction) return;

        const customer = getCustomer(selectedTransaction.customer_uuid);
        if (!customer?.phone) return;

        try {
            setIsSendingWhatsApp(true);
            // TODO: Implement WhatsApp sending functionality
            console.log("Send receipt to WhatsApp:", customer.phone);

            // For now, open WhatsApp web with the phone number
            const message = encodeURIComponent(`Receipt for transaction ${selectedTransaction.uuid}`);
            const phoneNumber = customer.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        } catch (err) {
            console.error("Error sending WhatsApp:", err);
            alert("Failed to send WhatsApp message");
        } finally {
            setIsSendingWhatsApp(false);
        }
    };

    const filteredTransactions = selectedBusiness
        ? transactions.filter((t) => t.business_uuid === selectedBusiness.uuid)
        : [];

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
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4">
                        <p className="text-lg text-muted-foreground">No transactions found</p>
                    </div>
                ) : (
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
                            {filteredTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {new Date(transaction.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getCustomerName(transaction.customer_uuid)}</TableCell>
                                    <TableCell>{getPaymentMethodName(transaction.payment_method_uuid)}</TableCell>
                                    <TableCell>${parseFloat(transaction.total_amount).toFixed(2)}</TableCell>
                                    <TableCell className="font-semibold">
                                        ${parseFloat(transaction.final_amount).toFixed(2)}
                                    </TableCell>
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
                                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                    <p className="text-sm">{getCustomerName(selectedTransaction.customer_uuid)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                                    <p className="text-sm">{getPaymentMethodName(selectedTransaction.payment_method_uuid)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                                    <p className="text-sm">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                                    <p className="text-sm font-mono">{selectedTransaction.uuid}</p>
                                </div>
                                {selectedTransaction.notes && (
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                        <p className="text-sm whitespace-pre-wrap">{selectedTransaction.notes}</p>
                                    </div>
                                )}
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

                            {/* Receipt Actions */}
                            <div className="space-y-2 pt-4 border-t">
                                <Button
                                    onClick={handleDownloadReceipt}
                                    disabled={receiptLoading}
                                    className="w-full"
                                    variant="default"
                                >
                                    {receiptLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="mr-2 h-4 w-4" />
                                    )}
                                    Download Receipt
                                </Button>

                                {selectedTransaction.customer_uuid && (() => {
                                    const customer = getCustomer(selectedTransaction.customer_uuid);
                                    const hasEmail = !!customer?.email;
                                    const hasPhone = !!customer?.phone;

                                    if (!hasEmail && !hasPhone) return null;

                                    return (
                                        <div className="flex gap-2">
                                            {hasEmail && (
                                                <Button
                                                    onClick={handleSendEmail}
                                                    disabled={isSendingEmail}
                                                    className={hasPhone ? "flex-1" : "w-full"}
                                                    variant="outline"
                                                >
                                                    {isSendingEmail ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Mail className="mr-2 h-4 w-4" />
                                                    )}
                                                    Send to Email
                                                </Button>
                                            )}
                                            {hasPhone && (
                                                <Button
                                                    onClick={handleSendWhatsApp}
                                                    disabled={isSendingWhatsApp}
                                                    className={hasEmail ? "flex-1" : "w-full"}
                                                    variant="outline"
                                                >
                                                    {isSendingWhatsApp ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <MessageCircle className="mr-2 h-4 w-4" />
                                                    )}
                                                    Send to WhatsApp
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
