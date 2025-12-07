"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, ShoppingCart, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { getItems } from "@/lib/api/items";
import { getCustomers } from "@/lib/api/customers";
import { getPaymentMethods } from "@/lib/api/payment-methods";
import { getItemTaxes } from "@/lib/api/item-taxes";
import { getItemDiscounts } from "@/lib/api/item-discounts";
import { createTransaction } from "@/lib/api/transactions";
import { createTransactionItem } from "@/lib/api/transaction-items";
import { getImageUrl } from "@/lib/images/operations";
import { useBusiness } from "@/contexts/business-context";
import type { Item, Customer, PaymentMethod, ItemTax, ItemDiscount, Transaction, TransactionItem } from "@/lib/api";
import Image from "next/image";
import { ReceiptPopup } from "@/components/receipt-popup";
import { convertTransactionToReceiptData } from "@/lib/receipt/utils";
import { useReceiptTemplatePreference } from "@/lib/receipt";

const ItemImageCard = memo(({ item }: { item: Item }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            if (item.image_size_bytes) {
                setLoading(true);
                const result = await getImageUrl({
                    folder: 'items',
                    uuid: item.uuid,
                });
                if (result.success && result.url) {
                    setImageUrl(result.url);
                }
                setLoading(false);
            }
        };
        loadImage();
    }, [item.uuid, item.image_size_bytes]);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (imageUrl) {
        return (
            <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-center p-4">
                <div className="text-4xl font-bold text-muted-foreground">
                    {item.name.substring(0, 2).toUpperCase()}
                </div>
            </div>
        </div>
    );
});

ItemImageCard.displayName = 'ItemImageCard';

export default function DashboardPage() {
    const { selectedBusiness } = useBusiness();
    const { includeLogo } = useReceiptTemplatePreference();
    const [items, setItems] = useState<Item[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [taxes, setTaxes] = useState<ItemTax[]>([]);
    const [discounts, setDiscounts] = useState<ItemDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cart, setCart] = useState<Map<string, number>>(new Map());
    const [isCheckout, setIsCheckout] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReceiptPopupOpen, setIsReceiptPopupOpen] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
    const [completedTransactionItems, setCompletedTransactionItems] = useState<TransactionItem[]>([]);
    const [completedCustomerName, setCompletedCustomerName] = useState<string | undefined>(undefined);
    const [completedPaymentMethodName, setCompletedPaymentMethodName] = useState<string>("Cash");
    const [completedCustomerEmail, setCompletedCustomerEmail] = useState<string | null>(null);
    const [completedCustomerPhone, setCompletedCustomerPhone] = useState<string | null>(null);
    const [businessLogoUrl, setBusinessLogoUrl] = useState<string | undefined>(undefined);


    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [
                itemsResponse,
                customersResponse,
                paymentMethodsResponse,
                taxesResponse,
                discountsResponse,
            ] = await Promise.all([
                getItems({ is_active: true }),
                getCustomers(),
                getPaymentMethods(),
                getItemTaxes(),
                getItemDiscounts(),
            ]);

            if (itemsResponse.success) {
                setItems(itemsResponse.data);
            } else {
                const errorData = itemsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load items");
            }

            if (customersResponse.success) {
                setCustomers(customersResponse.data);
            }

            if (paymentMethodsResponse.success) {
                setPaymentMethods(paymentMethodsResponse.data);
            }

            if (taxesResponse.success) {
                setTaxes(taxesResponse.data);
            }

            if (discountsResponse.success) {
                setDiscounts(discountsResponse.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const fetchBusinessLogo = async () => {
            if (selectedBusiness && includeLogo && selectedBusiness.image_size_bytes) {
                const result = await getImageUrl({
                    folder: 'businesses',
                    uuid: selectedBusiness.uuid,
                });
                if (result.success && result.url) {
                    setBusinessLogoUrl(result.url);
                } else {
                    setBusinessLogoUrl(undefined);
                }
            } else {
                setBusinessLogoUrl(undefined);
            }
        };

        fetchBusinessLogo();
    }, [selectedBusiness, includeLogo]);

    const addToCart = (itemUuid: string) => {
        setCart((prev) => {
            const newCart = new Map(prev);
            const currentQty = newCart.get(itemUuid) || 0;
            newCart.set(itemUuid, currentQty + 1);
            return newCart;
        });
    };

    const removeFromCart = (itemUuid: string) => {
        setCart((prev) => {
            const newCart = new Map(prev);
            const currentQty = newCart.get(itemUuid) || 0;
            if (currentQty > 1) {
                newCart.set(itemUuid, currentQty - 1);
            } else {
                newCart.delete(itemUuid);
            }
            return newCart;
        });
    };

    const getCartItemCount = (itemUuid: string) => {
        return cart.get(itemUuid) || 0;
    };

    const getTotalItems = () => {
        return Array.from(cart.values()).reduce((sum, qty) => sum + qty, 0);
    };

    const getTotalAmount = () => {
        let total = 0;
        cart.forEach((qty, itemUuid) => {
            const item = items.find((i) => i.uuid === itemUuid);
            if (item) {
                total += parseFloat(item.base_price) * qty;
            }
        });
        return total;
    };

    const calculateItemTax = (item: Item, basePrice: number) => {
        if (!item.tax_uuid) return 0;
        const tax = taxes.find((t) => t.uuid === item.tax_uuid);
        if (!tax) return 0;
        if (tax.type === "percentage") {
            return (basePrice * parseFloat(tax.value)) / 100;
        }
        return parseFloat(tax.value);
    };

    const calculateItemDiscount = (item: Item, basePrice: number) => {
        if (!item.discount_uuid) return 0;
        const discount = discounts.find((d) => d.uuid === item.discount_uuid);
        if (!discount) return 0;
        if (discount.type === "percentage") {
            return (basePrice * parseFloat(discount.value)) / 100;
        }
        return parseFloat(discount.value);
    };

    const getCartSummary = () => {
        let totalAmount = 0;
        let taxAmount = 0;
        let discountAmount = 0;

        cart.forEach((qty, itemUuid) => {
            const item = items.find((i) => i.uuid === itemUuid);
            if (item) {
                const basePrice = parseFloat(item.base_price) * qty;
                totalAmount += basePrice;
                taxAmount += calculateItemTax(item, basePrice);
                discountAmount += calculateItemDiscount(item, basePrice);
            }
        });

        const finalAmount = totalAmount + taxAmount - discountAmount;

        return { totalAmount, taxAmount, discountAmount, finalAmount };
    };

    const handleCompleteTransaction = async () => {
        if (!selectedBusiness) {
            setError("Please select a business from the sidebar");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const summary = getCartSummary();

            const transactionData = {
                business_uuid: selectedBusiness.uuid,
                customer_uuid: selectedCustomer || null,
                payment_method_uuid: selectedPaymentMethod || null,
                total_amount: summary.totalAmount,
                tax_amount: summary.taxAmount,
                discount_amount: summary.discountAmount,
                final_amount: summary.finalAmount,
                notes: notes || null,
            };

            const transactionResponse = await createTransaction(transactionData);

            if (!transactionResponse.success) {
                const errorData = transactionResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to create transaction");
                setIsSubmitting(false);
                return;
            }

            const transaction = transactionResponse.data;
            const createdItems: TransactionItem[] = [];

            for (const [itemUuid, qty] of cart.entries()) {
                const item = items.find((i) => i.uuid === itemUuid);
                if (item) {
                    const basePrice = parseFloat(item.base_price) * qty;
                    const taxAmount = calculateItemTax(item, basePrice);
                    const discountAmount = calculateItemDiscount(item, basePrice);
                    const totalPrice = basePrice + taxAmount - discountAmount;

                    const itemData = {
                        transaction_uuid: transaction.uuid,
                        name: item.name,
                        sku: item.sku || null,
                        description: item.description || null,
                        quantity: qty,
                        base_price: basePrice,
                        tax_amount: taxAmount,
                        discount_amount: discountAmount,
                        total_price: totalPrice,
                    };

                    await createTransactionItem(itemData);

                    createdItems.push({
                        id: 0,
                        uuid: `temp-${itemUuid}`,
                        transaction_uuid: transaction.uuid,
                        name: item.name,
                        sku: item.sku || null,
                        description: item.description || null,
                        quantity: qty,
                        base_price: basePrice.toString(),
                        tax_amount: taxAmount.toString(),
                        discount_amount: discountAmount.toString(),
                        total_price: totalPrice.toString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
                }
            }

            const customerData = selectedCustomer ? customers.find(c => c.uuid === selectedCustomer) : null;
            const paymentMethodData = selectedPaymentMethod ? paymentMethods.find(pm => pm.uuid === selectedPaymentMethod) : null;

            setCompletedTransaction(transaction);
            setCompletedTransactionItems(createdItems);
            setCompletedCustomerName(customerData?.name);
            setCompletedPaymentMethodName(paymentMethodData?.name || "Cash");
            setCompletedCustomerEmail(customerData?.email || null);
            setCompletedCustomerPhone(customerData?.phone || null);
            setIsReceiptPopupOpen(true);

            setCart(new Map());
            setIsCheckout(false);
            setSelectedCustomer("");
            setSelectedPaymentMethod("");
            setNotes("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while completing the transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredItems = selectedBusiness
        ? items.filter((item) => item.business_uuid === selectedBusiness.uuid)
        : [];

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">Error</p>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={loadData} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    if (isCheckout) {
        const summary = getCartSummary();
        const businessCustomers = selectedBusiness
            ? customers.filter((c) => c.business_uuid === selectedBusiness.uuid)
            : [];
        const businessPaymentMethods = selectedBusiness
            ? paymentMethods.filter((pm) => pm.business_uuid === selectedBusiness.uuid)
            : [];

        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => setIsCheckout(false)}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Items
                    </Button>
                    <h1 className="text-3xl font-bold">Checkout</h1>
                    <p className="text-muted-foreground">
                        Review your order and complete the transaction
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Tax</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from(cart.entries()).map(([itemUuid, qty]) => {
                                        const item = items.find((i) => i.uuid === itemUuid);
                                        if (!item) return null;
                                        const basePrice = parseFloat(item.base_price) * qty;
                                        const tax = calculateItemTax(item, basePrice);
                                        const discount = calculateItemDiscount(item, basePrice);
                                        const total = basePrice + tax - discount;
                                        return (
                                            <TableRow key={itemUuid}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{qty}</TableCell>
                                                <TableCell>${basePrice.toFixed(2)}</TableCell>
                                                <TableCell>${tax.toFixed(2)}</TableCell>
                                                <TableCell>-${discount.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    ${total.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="customer">Customer (Optional)</Label>
                                <select
                                    id="customer"
                                    value={selectedCustomer}
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                    disabled={isSubmitting}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select customer...</option>
                                    {businessCustomers.map((customer) => (
                                        <option key={customer.uuid} value={customer.uuid}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="paymentMethod">Payment Method (Optional)</Label>
                                <select
                                    id="paymentMethod"
                                    value={selectedPaymentMethod}
                                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    disabled={isSubmitting}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Select payment method...</option>
                                    {businessPaymentMethods.map((method) => (
                                        <option key={method.uuid} value={method.uuid}>
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={isSubmitting}
                                    placeholder="Add any notes about this transaction..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span className="font-medium">${summary.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax:</span>
                                <span className="font-medium">${summary.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount:</span>
                                <span className="font-medium text-green-600">
                                    -${summary.discountAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-3 text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-primary">${summary.finalAmount.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleCompleteTransaction}
                                disabled={isSubmitting}
                                className="w-full"
                                size="lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Complete Transaction
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">New Transaction</h1>
                    <p className="text-sm text-muted-foreground hidden sm:block">
                        Select items to add to the transaction
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="relative"
                        disabled={getTotalItems() === 0}
                    >
                        <ShoppingCart className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Cart</span>
                        {getTotalItems() > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]"
                            >
                                {getTotalItems()}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {filteredItems.length === 0 ? (
                <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                        <p className="text-lg font-semibold">No items available</p>
                        <p className="text-muted-foreground">
                            Add items to your inventory to start creating transactions
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {filteredItems.map((item) => {
                        const quantity = getCartItemCount(item.uuid);

                        return (
                            <Card
                                key={item.uuid}
                                className="py-0 group relative overflow-hidden transition-shadow hover:shadow-md"
                            >
                                <CardHeader className="px-0">
                                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                        <ItemImageCard item={item} />
                                        {!item.is_active && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute right-1 top-1 text-xs px-1"
                                            >
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4">
                                    <CardTitle className="mb-0.5 line-clamp-2 text-sm">
                                        {item.name}
                                    </CardTitle>
                                    {item.sku && (
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {item.sku}
                                        </p>
                                    )}
                                    <p className="mt-1 text-lg font-bold text-primary">
                                        ${parseFloat(item.base_price).toFixed(2)}
                                    </p>
                                </CardContent>
                                <CardFooter className="px-4 pb-4">
                                    {quantity > 0 ? (
                                        <div className="flex w-full items-center justify-between gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeFromCart(item.uuid)}
                                                className="h-7 w-7 p-0 text-base"
                                            >
                                                -
                                            </Button>
                                            <span className="text-sm font-semibold">
                                                {quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addToCart(item.uuid)}
                                                className="h-7 w-7 p-0 text-base"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => addToCart(item.uuid)}
                                            className="w-full h-7 text-xs"
                                            size="sm"
                                        >
                                            <Plus className="mr-1 h-3 w-3" />
                                            Add
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {getTotalItems() > 0 && (
                <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 rounded-lg border bg-card p-3 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex-1 sm:flex-none">
                            <p className="text-xs text-muted-foreground">Items</p>
                            <p className="text-lg sm:text-2xl font-bold">{getTotalItems()}</p>
                        </div>
                        <div className="h-10 sm:h-12 w-px bg-border" />
                        <div className="flex-1 sm:flex-none">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="text-lg sm:text-2xl font-bold text-primary">
                                ${getTotalAmount().toFixed(2)}
                            </p>
                        </div>
                        <Button size="sm" className="sm:h-10 sm:px-6 sm:ml-4" onClick={() => setIsCheckout(true)}>
                            Checkout
                        </Button>
                    </div>
                </div>
            )}

            {completedTransaction && selectedBusiness && (
                <ReceiptPopup
                    open={isReceiptPopupOpen}
                    onOpenChange={(open) => {
                        setIsReceiptPopupOpen(open);
                        if (!open) {
                            setCompletedTransaction(null);
                            setCompletedTransactionItems([]);
                            setCompletedCustomerName(undefined);
                            setCompletedPaymentMethodName("Cash");
                            setCompletedCustomerEmail(null);
                            setCompletedCustomerPhone(null);
                        }
                    }}
                    receiptData={convertTransactionToReceiptData(
                        completedTransaction,
                        completedTransactionItems,
                        selectedBusiness,
                        completedCustomerName,
                        completedPaymentMethodName,
                        undefined,
                        businessLogoUrl
                    )}
                    customerEmail={completedCustomerEmail}
                    customerPhone={completedCustomerPhone}
                />
            )}
        </div>
    );
}

