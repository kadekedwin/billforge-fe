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
import { getBusinesses } from "@/lib/api/businesses";
import { getCustomers } from "@/lib/api/customers";
import { getPaymentMethods } from "@/lib/api/payment-methods";
import { getItemTaxes } from "@/lib/api/item-taxes";
import { getItemDiscounts } from "@/lib/api/item-discounts";
import { createTransaction } from "@/lib/api/transactions";
import { createTransactionItem } from "@/lib/api/transaction-items";
import { getImageUrl } from "@/lib/images";
import type { Item, Business, Customer, PaymentMethod, ItemTax, ItemDiscount } from "@/lib/api";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

export default function TransactionsPage() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [taxes, setTaxes] = useState<ItemTax[]>([]);
    const [discounts, setDiscounts] = useState<ItemDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBusiness, setSelectedBusiness] = useState<string>("");
    const [cart, setCart] = useState<Map<string, number>>(new Map());
    const [isCheckout, setIsCheckout] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);


    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [
                itemsResponse,
                businessesResponse,
                customersResponse,
                paymentMethodsResponse,
                taxesResponse,
                discountsResponse,
            ] = await Promise.all([
                getItems({ is_active: true }),
                getBusinesses(),
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

            if (businessesResponse.success) {
                setBusinesses(businessesResponse.data);
                if (businessesResponse.data.length > 0 && !selectedBusiness) {
                    setSelectedBusiness(businessesResponse.data[0].uuid);
                }
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
    }, [selectedBusiness]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
            setError("Please select a business");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const summary = getCartSummary();

            const transactionData = {
                business_uuid: selectedBusiness,
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

            for (const [itemUuid, qty] of cart.entries()) {
                const item = items.find((i) => i.uuid === itemUuid);
                if (item) {
                    const basePrice = parseFloat(item.base_price) * qty;
                    const taxAmount = calculateItemTax(item, basePrice);
                    const discountAmount = calculateItemDiscount(item, basePrice);
                    const totalPrice = basePrice + taxAmount - discountAmount;

                    await createTransactionItem({
                        transaction_uuid: transaction.uuid,
                        name: item.name,
                        sku: item.sku || null,
                        description: item.description || null,
                        quantity: qty,
                        base_price: basePrice,
                        tax_amount: taxAmount,
                        discount_amount: discountAmount,
                        total_price: totalPrice,
                    });
                }
            }

            setCart(new Map());
            setIsCheckout(false);
            setSelectedCustomer("");
            setSelectedPaymentMethod("");
            setNotes("");
            router.push("/transactions");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred while completing the transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredItems = selectedBusiness
        ? items.filter((item) => item.business_uuid === selectedBusiness)
        : items;

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
        const businessCustomers = customers.filter((c) => c.business_uuid === selectedBusiness);
        const businessPaymentMethods = paymentMethods.filter((pm) => pm.business_uuid === selectedBusiness);

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
        <div className="container mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">New Transaction</h1>
                    <p className="text-muted-foreground">
                        Select items to add to the transaction
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {businesses.length > 1 && (
                        <select
                            value={selectedBusiness}
                            onChange={(e) => setSelectedBusiness(e.target.value)}
                            className="rounded-md border border-input bg-background px-3 py-2"
                        >
                            {businesses.map((business) => (
                                <option key={business.uuid} value={business.uuid}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <Button
                        variant="outline"
                        className="relative"
                        disabled={getTotalItems() === 0}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Cart
                        {getTotalItems() > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
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
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.map((item) => {
                        const quantity = getCartItemCount(item.uuid);
                        const business = businesses.find(
                            (b) => b.uuid === item.business_uuid
                        );

                        return (
                            <Card
                                key={item.uuid}
                                className="group relative overflow-hidden transition-shadow hover:shadow-lg"
                            >
                                <CardHeader className="p-0">
                                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                                        <ItemImageCard item={item} />
                                        {!item.is_active && (
                                            <Badge
                                                variant="destructive"
                                                className="absolute right-2 top-2"
                                            >
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="mb-1 line-clamp-2 text-lg">
                                        {item.name}
                                    </CardTitle>
                                    {item.sku && (
                                        <p className="text-xs text-muted-foreground">
                                            SKU: {item.sku}
                                        </p>
                                    )}
                                    {item.description && (
                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    )}
                                    <p className="mt-3 text-2xl font-bold text-primary">
                                        ${parseFloat(item.base_price).toFixed(2)}
                                    </p>
                                    {business && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {business.name}
                                        </p>
                                    )}
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    {quantity > 0 ? (
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeFromCart(item.uuid)}
                                                className="h-9 w-9 p-0"
                                            >
                                                -
                                            </Button>
                                            <span className="text-lg font-semibold">
                                                {quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addToCart(item.uuid)}
                                                className="h-9 w-9 p-0"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => addToCart(item.uuid)}
                                            className="w-full"
                                            size="sm"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {getTotalItems() > 0 && (
                <div className="fixed bottom-6 right-6 rounded-lg border bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Items</p>
                            <p className="text-2xl font-bold">{getTotalItems()}</p>
                        </div>
                        <div className="h-12 w-px bg-border" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">
                                ${getTotalAmount().toFixed(2)}
                            </p>
                        </div>
                        <Button size="lg" className="ml-4" onClick={() => setIsCheckout(true)}>
                            Checkout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

