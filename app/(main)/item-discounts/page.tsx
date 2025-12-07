"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { getItemDiscounts, createItemDiscount, updateItemDiscount, deleteItemDiscount } from "@/lib/api/item-discounts";
import { useBusiness } from "@/contexts/business-context";
import type { ItemDiscount, CreateItemDiscountRequest, UpdateItemDiscountRequest } from "@/lib/api";

export default function ItemDiscountsPage() {
    const { selectedBusiness } = useBusiness();
    const [discounts, setDiscounts] = useState<ItemDiscount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<ItemDiscount | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingDiscount, setEditingDiscount] = useState<ItemDiscount | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<CreateItemDiscountRequest, "business_uuid">>({
        name: "",
        type: "percentage",
        value: 0,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, [selectedBusiness]);

    const loadData = async () => {
        if (!selectedBusiness) return;

        try {
            setIsLoading(true);
            setError(null);
            const discountsResponse = await getItemDiscounts();

            if (discountsResponse.success) {
                const filteredDiscounts = discountsResponse.data.filter(
                    (discount) => discount.business_uuid === selectedBusiness.uuid
                );
                setDiscounts(filteredDiscounts);
            } else {
                const errorData = discountsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load discounts");
            }
        } catch (err) {
            setError("An error occurred while loading data");
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | number = value;

        if (name === "value") {
            processedValue = parseFloat(value) || 0;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        try {
            if (editingDiscount) {
                const updateData: UpdateItemDiscountRequest = {
                    business_uuid: selectedBusiness.uuid,
                    name: formData.name,
                    type: formData.type,
                    value: formData.value,
                };
                const response = await updateItemDiscount(editingDiscount.uuid, updateData);
                if (response.success) {
                    setDiscounts((prev) =>
                        prev.map((discount) =>
                            discount.uuid === editingDiscount.uuid ? response.data : discount
                        )
                    );
                    setIsDialogOpen(false);
                    setFormData({
                        name: "",
                        type: "percentage",
                        value: 0,
                    });
                    setEditingDiscount(null);
                } else {
                    const errorData = response as unknown as {
                        success: false;
                        message: string;
                        errors?: Record<string, string[]>;
                    };
                    if (errorData.errors) {
                        const errors: Record<string, string> = {};
                        Object.keys(errorData.errors).forEach((key) => {
                            if (errorData.errors) {
                                errors[key] = errorData.errors[key][0];
                            }
                        });
                        setFormErrors(errors);
                    } else if (errorData.message) {
                        setError(errorData.message);
                    } else {
                        setError("Failed to update discount");
                    }
                }
            } else {
                const response = await createItemDiscount({
                    ...formData,
                    business_uuid: selectedBusiness.uuid,
                });
                if (response.success) {
                    setDiscounts((prev) => [...prev, response.data]);
                    setIsDialogOpen(false);
                    setFormData({
                        name: "",
                        type: "percentage",
                        value: 0,
                    });
                } else {
                    const errorData = response as unknown as {
                        success: false;
                        message: string;
                        errors?: Record<string, string[]>;
                    };
                    if (errorData.errors) {
                        const errors: Record<string, string> = {};
                        Object.keys(errorData.errors).forEach((key) => {
                            if (errorData.errors) {
                                errors[key] = errorData.errors[key][0];
                            }
                        });
                        setFormErrors(errors);
                    } else if (errorData.message) {
                        setError(errorData.message);
                    } else {
                        setError("Failed to create discount");
                    }
                }
            }
        } catch (err) {
            setError(editingDiscount ? "An error occurred while updating discount" : "An error occurred while creating discount");
            console.error("Error saving discount:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (discount: ItemDiscount) => {
        setDiscountToDelete(discount);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!discountToDelete) return;

        try {
            setDeletingId(discountToDelete.id);
            setError(null);
            const response = await deleteItemDiscount(discountToDelete.uuid);
            if (response.success) {
                setDiscounts((prev) => prev.filter((discount) => discount.uuid !== discountToDelete.uuid));
                setIsDeleteDialogOpen(false);
                setDiscountToDelete(null);
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to delete discount");
            }
        } catch (err) {
            setError("An error occurred while deleting discount");
            console.error("Error deleting discount:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (discount: ItemDiscount) => {
        setEditingDiscount(discount);
        setFormData({
            name: discount.name,
            type: discount.type,
            value: parseFloat(discount.value),
        });
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingDiscount(null);
            setFormData({
                name: "",
                type: "percentage",
                value: 0,
            });
            setFormErrors({});
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Item Discounts</h1>
                    <p className="text-muted-foreground">
                        Manage discount configurations for your items
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Discount
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingDiscount ? "Edit Discount" : "Create New Discount"}</DialogTitle>
                                <DialogDescription>
                                    {editingDiscount ? "Update discount configuration" : "Add a new discount configuration"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {error && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Discount Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Holiday Sale, Early Bird..."
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        required
                                        maxLength={100}
                                        className={formErrors.name ? "border-destructive" : ""}
                                    />
                                    {formErrors.name && (
                                        <p className="text-sm text-destructive">{formErrors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        required
                                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.type ? "border-destructive" : ""}`}
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="fixed">Fixed Amount</option>
                                    </select>
                                    {formErrors.type && (
                                        <p className="text-sm text-destructive">{formErrors.type}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="value">
                                        Value {formData.type === "percentage" ? "(%)" : "($)"}
                                    </Label>
                                    <Input
                                        id="value"
                                        name="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder={formData.type === "percentage" ? "20" : "10.00"}
                                        value={formData.value === 0 ? "" : formData.value}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        required
                                        className={formErrors.value ? "border-destructive" : ""}
                                    />
                                    {formErrors.value && (
                                        <p className="text-sm text-destructive">{formErrors.value}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleDialogClose(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingDiscount ? "Update Discount" : "Create Discount"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {error && !isDialogOpen && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : discounts.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No discounts found. Create your first discount configuration.</p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts.map((discount) => (
                                <TableRow key={discount.id}>
                                    <TableCell>{discount.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={discount.type === "percentage" ? "default" : "secondary"}>
                                            {discount.type === "percentage" ? "Percentage" : "Fixed"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(discount)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(discount)}
                                                disabled={deletingId === discount.id}
                                            >
                                                {deletingId === discount.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the discount &quot;{discountToDelete?.name}&quot;.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

