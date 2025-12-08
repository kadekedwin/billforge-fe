"use client";

import { Button } from "@/components/ui/button";

interface CartSummaryProps {
    totalItems: number;
    totalAmount: number;
    onCheckout: () => void;
}

export function CartSummary({ totalItems, totalAmount, onCheckout }: CartSummaryProps) {
    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 rounded-lg border bg-card p-3 shadow-lg">
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex-1 sm:flex-none">
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="text-lg sm:text-2xl font-bold">{totalItems}</p>
                </div>
                <div className="h-10 sm:h-12 w-px bg-border" />
                <div className="flex-1 sm:flex-none">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg sm:text-2xl font-bold text-primary">
                        ${totalAmount.toFixed(2)}
                    </p>
                </div>
                <Button
                    size="sm"
                    className="sm:h-10 sm:px-6 sm:ml-4"
                    onClick={onCheckout}
                >
                    Checkout
                </Button>
            </div>
        </div>
    );
}