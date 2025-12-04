"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Loader2 } from "lucide-react";
import { getItems } from "@/lib/api/items";
import { getBusinesses } from "@/lib/api/businesses";
import type { Item, Business } from "@/lib/api/types";
import Image from "next/image";

export default function TransactionsPage() {
    const [items, setItems] = useState<Item[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBusiness, setSelectedBusiness] = useState<string>("");
    const [cart, setCart] = useState<Map<string, number>>(new Map());


    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [itemsResponse, businessesResponse] = await Promise.all([
                getItems({ is_active: true }),
                getBusinesses(),
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
                                        <Image
                                            src="/placeholder.svg"
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
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
                        <Button size="lg" className="ml-4">
                            Checkout
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

