"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Item } from "@/lib/api";
import { ItemImageCard } from "./ItemImageCard";

interface ItemCardProps {
    item: Item;
    quantity: number;
    onAdd: (itemUuid: string) => void;
    onRemove: (itemUuid: string) => void;
}

export function ItemCard({ item, quantity, onAdd, onRemove }: ItemCardProps) {
    return (
        <Card className="py-0 group relative overflow-hidden transition-shadow hover:shadow-md">
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
                            onClick={() => onRemove(item.uuid)}
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
                            onClick={() => onAdd(item.uuid)}
                            className="h-7 w-7 p-0 text-base"
                        >
                            +
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={() => onAdd(item.uuid)}
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
}