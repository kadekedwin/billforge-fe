"use client";

import { useState } from "react";

interface UseCartResult {
    cart: Map<string, number>;
    addToCart: (itemUuid: string) => void;
    removeFromCart: (itemUuid: string) => void;
    clearCart: () => void;
}

export function useCart(): UseCartResult {
    const [cart, setCart] = useState<Map<string, number>>(new Map());

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

    const clearCart = () => {
        setCart(new Map());
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        clearCart,
    };
}