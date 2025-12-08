"use client";

import { useState } from "react";
import { useBusiness } from "@/contexts/business-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import type { PaymentMethod } from "@/lib/api";
import { PaymentMethodsTable } from "./PaymentMethodsTable";
import { PaymentMethodFormDialog } from "./PaymentMethodFormDialog";
import { DeletePaymentMethodDialog } from "./DeletePaymentMethodDialog";
import { usePaymentMethodsData } from "./usePaymentMethodsData";
import { usePaymentMethodForm } from "./usePaymentMethodForm";
import {
    handleCreatePaymentMethod,
    handleUpdatePaymentMethod,
    handleDeletePaymentMethod,
} from "./paymentMethodOperations";

export default function PaymentMethodsPage() {
    const { selectedBusiness } = useBusiness();
    const { paymentMethods, isLoading, error, setPaymentMethods, setError } = usePaymentMethodsData(selectedBusiness);
    const {
        formData,
        formErrors,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadPaymentMethodForEdit,
    } = usePaymentMethodForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [paymentMethodToDelete, setPaymentMethodToDelete] = useState<PaymentMethod | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        const result = editingPaymentMethod
            ? await handleUpdatePaymentMethod({
                paymentMethod: editingPaymentMethod,
                formData,
                businessUuid: selectedBusiness.uuid,
            })
            : await handleCreatePaymentMethod({
                formData,
                businessUuid: selectedBusiness.uuid,
            });

        if (result.success && result.paymentMethod) {
            if (editingPaymentMethod) {
                setPaymentMethods((prev) =>
                    prev.map((pm) =>
                        pm.uuid === editingPaymentMethod.uuid ? result.paymentMethod! : pm
                    )
                );
            } else {
                setPaymentMethods((prev) => [...prev, result.paymentMethod!]);
            }
            setIsDialogOpen(false);
            setEditingPaymentMethod(null);
            resetForm();
        } else {
            if (result.errors) {
                setFormErrors(result.errors);
            } else if (result.error) {
                setError(result.error);
            }
        }

        setIsSubmitting(false);
    };

    const handleDeleteClick = (paymentMethod: PaymentMethod) => {
        setPaymentMethodToDelete(paymentMethod);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!paymentMethodToDelete) return;

        setDeletingId(paymentMethodToDelete.id);
        setError(null);

        const result = await handleDeletePaymentMethod(paymentMethodToDelete);

        if (result.success) {
            setPaymentMethods((prev) => prev.filter((pm) => pm.uuid !== paymentMethodToDelete.uuid));
            setIsDeleteDialogOpen(false);
            setPaymentMethodToDelete(null);
        } else {
            setError(result.error || "Failed to delete payment method");
        }

        setDeletingId(null);
    };

    const handleEdit = (paymentMethod: PaymentMethod) => {
        setEditingPaymentMethod(paymentMethod);
        loadPaymentMethodForEdit(paymentMethod);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingPaymentMethod(null);
            resetForm();
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
                    <PaymentMethodFormDialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogClose}
                        editingPaymentMethod={editingPaymentMethod}
                        formData={formData}
                        formErrors={formErrors}
                        error={error}
                        isSubmitting={isSubmitting}
                        onInputChange={handleInputChange}
                        onSubmit={handleSubmit}
                    />
                </Dialog>
            </div>

            {error && !isDialogOpen && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <PaymentMethodsTable
                paymentMethods={paymentMethods}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAddFirst={() => setIsDialogOpen(true)}
            />

            <DeletePaymentMethodDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                paymentMethod={paymentMethodToDelete}
                isDeleting={!!deletingId}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}