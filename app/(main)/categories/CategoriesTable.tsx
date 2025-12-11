"use client";

import {Button} from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Plus, Loader2, Pencil, Trash2} from "lucide-react";
import type {Category} from "@/lib/api";

interface CategoriesTableProps {
    categories: Category[];
    isLoading: boolean;
    deletingId: number | null;
    onEdit: (category: Category) => void;
    onDelete: (category: Category) => void;
    onAddFirst: () => void;
}

export function CategoriesTable({
                                   categories,
                                   isLoading,
                                   deletingId,
                                   onEdit,
                                   onDelete,
                                   onAddFirst,
                               }: CategoriesTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                </div>
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="rounded-lg border bg-card">
                <div className="flex h-64 flex-col items-center justify-center space-y-4">
                    <p className="text-lg text-muted-foreground">No categories found</p>
                    <Button onClick={onAddFirst}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Add Your First Category
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
                        <TableHead>Name</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>
                                {new Date(category.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(category)}
                                    >
                                        <Pencil className="h-4 w-4"/>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(category)}
                                        disabled={deletingId === category.id}
                                    >
                                        {deletingId === category.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin"/>
                                        ) : (
                                            <Trash2 className="h-4 w-4 text-destructive"/>
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
