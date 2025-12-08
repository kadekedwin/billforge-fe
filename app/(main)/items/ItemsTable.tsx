"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import type { Item } from "@/lib/api";
import { ItemImage } from "./ItemImage";

interface ItemsTableProps {
    items: Item[];
    isLoading: boolean;
    deletingId: number | null;
    onEdit: (item: Item) => void;
    onDelete: (item: Item) => void;
    onAddFirst: () => void;
    getBusinessName: (businessUuid: string) => string;
}

export function ItemsTable({
                               items,
                               isLoading,
                               deletingId,
                               onEdit,
                               onDelete,
                               onAddFirst,
                               getBusinessName,
                           }: ItemsTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 flex-col items-center justify-center space-y-4">
                    <p className="text-lg text-muted-foreground">No items found</p>
                    <Button onClick={onAddFirst}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Item
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <ItemImage item={item} />
                            </TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                            <TableCell>{getBusinessName(item.business_uuid)}</TableCell>
                            <TableCell>${parseFloat(item.base_price).toFixed(2)}</TableCell>
                            <TableCell>
                                {item.is_active ? (
                                    <Badge variant="default" className="bg-green-500">Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {new Date(item.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(item)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(item)}
                                        disabled={deletingId === item.id}
                                    >
                                        {deletingId === item.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}