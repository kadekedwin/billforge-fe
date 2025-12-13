"use client";

import { useState } from "react";

const MAX_QUANTITY = 999999;

interface UseCartResult {
    cart: Map<string, number>;
    addToCart: (itemUuid: string) => void;
    removeFromCart: (itemUuid: string) => void;
    setQuantity: (itemUuid: string, quantity: number) => void;
    clearCart: () => void;
}

export function useCart(): UseCartResult {
    const [cart, setCart] = useState<Map<string, number>>(new Map());

    const addToCart = (itemUuid: string) => {
        setCart((prev) => {
            const newCart = new Map(prev);
            const currentQty = newCart.get(itemUuid) || 0;
            if (currentQty < MAX_QUANTITY) {
                newCart.set(itemUuid, currentQty + 1);
            }
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

    const setQuantity = (itemUuid: string, quantity: number) => {
        setCart((prev) => {
            const newCart = new Map(prev);

            // If quantity is 0 or negative, remove from cart
            if (quantity <= 0) {
                newCart.delete(itemUuid);
            } else {
                // Cap at maximum quantity
                const cappedQuantity = Math.min(quantity, MAX_QUANTITY);
                newCart.set(itemUuid, cappedQuantity);
            }

            return newCart;
        });
    };

    const clearCart = () => {
        setCart(new Map());
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        setQuantity,
        clearCart,
    };
}