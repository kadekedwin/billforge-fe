"use client";

import type { Item } from "@/lib/api";
import { ItemCard } from "./ItemCard";

interface ItemsGridProps {
    items: Item[];
    cart: Map<string, number>;
    onAddToCart: (itemUuid: string) => void;
    onRemoveFromCart: (itemUuid: string) => void;
}

export function ItemsGrid({ items, cart, onAddToCart, onRemoveFromCart }: ItemsGridProps) {
    if (items.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                    <p className="text-lg font-semibold">No items available</p>
                    <p className="text-muted-foreground">
                        Add items to your inventory to start creating transactions
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => {
                const quantity = cart.get(item.uuid) || 0;

                return (
                    <ItemCard
                        key={item.uuid}
                        item={item}
                        quantity={quantity}
                        onAdd={onAddToCart}
                        onRemove={onRemoveFromCart}
                    />
                );
            })}
        </div>
    );
}