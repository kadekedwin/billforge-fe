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
import { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/lib/api/payment-methods";
import { useBusiness } from "@/contexts/business-context";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import type { PaymentMethod, CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from "@/lib/api";

export default function PaymentMethodsPage() {
    const { selectedBusiness } = useBusiness();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethod | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<CreatePaymentMethodRequest, "business_uuid">>({
        name: "",
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
            const paymentMethodsResponse = await getPaymentMethods();

            if (paymentMethodsResponse.success) {
                const filteredPaymentMethods = paymentMethodsResponse.data.filter(
                    (pm) => pm.business_uuid === selectedBusiness.uuid
                );
                setPaymentMethods(filteredPaymentMethods);
            } else {
                const errorData = paymentMethodsResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load payment methods");
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

        setFormData((prev) => ({
            ...prev,
            [name]: value
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
            if (editingPaymentMethod) {
                const updateData: UpdatePaymentMethodRequest = {
                    business_uuid: selectedBusiness.uuid,
                    name: formData.name,
                };
                const response = await updatePaymentMethod(editingPaymentMethod.uuid, updateData);
                if (response.success) {
                    setPaymentMethods((prev) =>
                        prev.map((paymentMethod) =>
                            paymentMethod.uuid === editingPaymentMethod.uuid ? response.data : paymentMethod
                        )
                    );
                    setIsDialogOpen(false);
                    setFormData({
                        name: "",
                    });
                    setEditingPaymentMethod(null);
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
                        setError("Failed to update payment method");
                    }
                }
            } else {
                const response = await createPaymentMethod({
                    ...formData,
                    business_uuid: selectedBusiness.uuid,
                });
                if (response.success) {
                    setPaymentMethods((prev) => [...prev, response.data]);
                    setIsDialogOpen(false);
                    setFormData({
                        name: "",
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
                        setError("Failed to create payment method");
                    }
                }
            }
        } catch (err) {
            setError(editingPaymentMethod ? "An error occurred while updating payment method" : "An error occurred while creating payment method");
            console.error("Error saving payment method:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (paymentMethod: PaymentMethod) => {
        setPaymentMethodToDelete(paymentMethod);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!paymentMethodToDelete) return;

        try {
            setDeletingId(paymentMethodToDelete.id);
            setError(null);
            const response = await deletePaymentMethod(paymentMethodToDelete.uuid);
            if (response.success) {
                setPaymentMethods((prev) => prev.filter((paymentMethod) => paymentMethod.uuid !== paymentMethodToDelete.uuid));
                setIsDeleteDialogOpen(false);
                setPaymentMethodToDelete(null);
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to delete payment method");
            }
        } catch (err) {
            setError("An error occurred while deleting payment method");
            console.error("Error deleting payment method:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (paymentMethod: PaymentMethod) => {
        setEditingPaymentMethod(paymentMethod);
        setFormData({
            name: paymentMethod.name,
        });
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingPaymentMethod(null);
            setFormData({
                name: "",
            });
            setFormErrors({});
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={(e) => {
                                if (paymentMethods.length >= LIMITS.MAX_PAYMENT_METHODS) {
                                    e.preventDefault();
                                    setError(getLimitMessage('MAX_PAYMENT_METHODS'));
                                }
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Payment Method
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingPaymentMethod ? "Edit Payment Method" : "Create New Payment Method"}</DialogTitle>
                                <DialogDescription>
                                    {editingPaymentMethod ? "Update payment method information" : "Add a new payment method"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {error && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Payment Method Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g., Cash, Credit Card, Bank Transfer"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        required
                                        className={formErrors.name ? "border-destructive" : ""}
                                    />
                                    {formErrors.name && (
                                        <p className="text-sm text-destructive">{formErrors.name}</p>
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
                                    {editingPaymentMethod ? "Update Payment Method" : "Create Payment Method"}
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

            <div className="rounded-lg border bg-card">
                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : paymentMethods.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4">
                        <p className="text-lg text-muted-foreground">No payment methods found</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Payment Method
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentMethods.map((paymentMethod) => (
                                <TableRow key={paymentMethod.id}>
                                    <TableCell>
                                        <Badge variant="outline">{paymentMethod.name}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(paymentMethod.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(paymentMethod)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(paymentMethod)}
                                                disabled={deletingId === paymentMethod.id}
                                            >
                                                {deletingId === paymentMethod.id ? (
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
                )}
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the payment method <span className="font-semibold">{paymentMethodToDelete?.name}</span>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={!!deletingId}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletingId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

