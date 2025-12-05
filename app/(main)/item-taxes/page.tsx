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
import { getItemTaxes, createItemTax, updateItemTax, deleteItemTax } from "@/lib/api/item-taxes";
import { getBusinesses } from "@/lib/api/businesses";
import type { ItemTax, CreateItemTaxRequest, UpdateItemTaxRequest, Business } from "@/lib/api";

export default function ItemTaxesPage() {
    const [taxes, setTaxes] = useState<ItemTax[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [taxToDelete, setTaxToDelete] = useState<ItemTax | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingTax, setEditingTax] = useState<ItemTax | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateItemTaxRequest>({
        business_uuid: "",
        name: "",
        type: "percentage",
        value: 0,
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [taxesResponse, businessesResponse] = await Promise.all([
                getItemTaxes(),
                getBusinesses(),
            ]);

            if (taxesResponse.success) {
                setTaxes(taxesResponse.data);
            } else {
                const errorData = taxesResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load taxes");
            }

            if (businessesResponse.success) {
                setBusinesses(businessesResponse.data);
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
        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        try {
            if (editingTax) {
                const updateData: UpdateItemTaxRequest = {
                    business_uuid: formData.business_uuid,
                    name: formData.name,
                    type: formData.type,
                    value: formData.value,
                };
                const response = await updateItemTax(editingTax.id, updateData);
                if (response.success) {
                    setTaxes((prev) =>
                        prev.map((tax) =>
                            tax.id === editingTax.id ? response.data : tax
                        )
                    );
                    setIsDialogOpen(false);
                    setFormData({
                        business_uuid: "",
                        name: "",
                        type: "percentage",
                        value: 0,
                    });
                    setEditingTax(null);
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
                        setError("Failed to update tax");
                    }
                }
            } else {
                const response = await createItemTax(formData);
                if (response.success) {
                    setTaxes((prev) => [...prev, response.data]);
                    setIsDialogOpen(false);
                    setFormData({
                        business_uuid: "",
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
                        setError("Failed to create tax");
                    }
                }
            }
        } catch (err) {
            setError(editingTax ? "An error occurred while updating tax" : "An error occurred while creating tax");
            console.error("Error saving tax:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (tax: ItemTax) => {
        setTaxToDelete(tax);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!taxToDelete) return;

        try {
            setDeletingId(taxToDelete.id);
            setError(null);
            const response = await deleteItemTax(taxToDelete.id);
            if (response.success) {
                setTaxes((prev) => prev.filter((tax) => tax.id !== taxToDelete.id));
                setIsDeleteDialogOpen(false);
                setTaxToDelete(null);
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to delete tax");
            }
        } catch (err) {
            setError("An error occurred while deleting tax");
            console.error("Error deleting tax:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (tax: ItemTax) => {
        setEditingTax(tax);
        setFormData({
            business_uuid: tax.business_uuid,
            name: tax.name,
            type: tax.type,
            value: parseFloat(tax.value),
        });
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingTax(null);
            setFormData({
                business_uuid: "",
                name: "",
                type: "percentage",
                value: 0,
            });
            setFormErrors({});
            setError(null);
        }
    };

    const getBusinessName = (business_uuid: string) => {
        const business = businesses.find(b => b.uuid === business_uuid);
        return business?.name || "Unknown Business";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Item Taxes</h1>
                    <p className="text-muted-foreground">
                        Manage tax configurations for your items
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tax
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingTax ? "Edit Tax" : "Create New Tax"}</DialogTitle>
                                <DialogDescription>
                                    {editingTax ? "Update tax configuration" : "Add a new tax configuration"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {error && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="business_uuid">Business</Label>
                                    <select
                                        id="business_uuid"
                                        name="business_uuid"
                                        value={formData.business_uuid}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        required
                                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.business_uuid ? "border-destructive" : ""}`}
                                    >
                                        <option value="">Select a business</option>
                                        {businesses.map((business) => (
                                            <option key={business.uuid} value={business.uuid}>
                                                {business.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.business_uuid && (
                                        <p className="text-sm text-destructive">{formErrors.business_uuid}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tax Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="VAT, GST, Sales Tax..."
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
                                        placeholder={formData.type === "percentage" ? "10" : "5.00"}
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
                                    {editingTax ? "Update Tax" : "Create Tax"}
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
            ) : taxes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No taxes found. Create your first tax configuration.</p>
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxes.map((tax) => (
                                <TableRow key={tax.id}>
                                    <TableCell className="font-medium">
                                        {getBusinessName(tax.business_uuid)}
                                    </TableCell>
                                    <TableCell>{tax.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={tax.type === "percentage" ? "default" : "secondary"}>
                                            {tax.type === "percentage" ? "Percentage" : "Fixed"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {tax.type === "percentage" ? `${tax.value}%` : `$${tax.value}`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(tax)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(tax)}
                                                disabled={deletingId === tax.id}
                                            >
                                                {deletingId === tax.id ? (
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
                            This will permanently delete the tax &quot;{taxToDelete?.name}&quot;.
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

