"use client";

import { useState } from "react";
import { useBusiness } from "@/contexts/business-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { LIMITS, getLimitMessage } from "@/lib/config/limits";
import type { Customer } from "@/lib/api";
import { CustomersTable } from "./CustomersTable";
import { CustomerFormDialog } from "./CustomerFormDialog";
import { DeleteCustomerDialog } from "./DeleteCustomerDialog";
import { useCustomersData } from "./useCustomersData";
import { useCustomerForm } from "./useCustomerForm";
import { handleCreateCustomer, handleUpdateCustomer, handleDeleteCustomer } from "./customerOperations";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function CustomersPage() {
    const { t } = useTranslation();
    const { selectedBusiness } = useBusiness();
    const { customers, isLoading, error, setCustomers, setError } = useCustomersData(selectedBusiness);
    const {
        formData,
        formErrors,
        setFormErrors,
        handleInputChange,
        resetForm,
        loadCustomerForEdit,
    } = useCustomerForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBusiness) return;

        setIsSubmitting(true);
        setFormErrors({});
        setError(null);

        const result = editingCustomer
            ? await handleUpdateCustomer({
                customer: editingCustomer,
                formData,
                businessUuid: selectedBusiness.uuid,
                t,
            })
            : await handleCreateCustomer({
                formData,
                businessUuid: selectedBusiness.uuid,
                t,
            });

        if (result.success && result.customer) {
            if (editingCustomer) {
                setCustomers((prev) =>
                    prev.map((customer) =>
                        customer.uuid === editingCustomer.uuid ? result.customer! : customer
                    )
                );
            } else {
                setCustomers((prev) => [...prev, result.customer!]);
            }
            setIsDialogOpen(false);
            setEditingCustomer(null);
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

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;

        setDeletingId(customerToDelete.id);
        setError(null);

        const result = await handleDeleteCustomer(customerToDelete, t);

        if (result.success) {
            setCustomers((prev) => prev.filter((customer) => customer.uuid !== customerToDelete.uuid));
            setIsDeleteDialogOpen(false);
            setCustomerToDelete(null);
        } else {
            setError(result.error || t('app.customers.deleteError'));
        }

        setDeletingId(null);
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        loadCustomerForEdit(customer);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingCustomer(null);
            resetForm();
            setFormErrors({});
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('app.customers.title')}</h1>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={(e) => {
                                if (customers.length >= LIMITS.MAX_CUSTOMERS) {
                                    e.preventDefault();
                                    setError(getLimitMessage('MAX_CUSTOMERS'));
                                }
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {t('app.customers.addCustomer')}
                        </Button>
                    </DialogTrigger>
                    <CustomerFormDialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogClose}
                        editingCustomer={editingCustomer}
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

            <CustomersTable
                customers={customers}
                isLoading={isLoading}
                deletingId={deletingId}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAddFirst={() => setIsDialogOpen(true)}
            />

            <DeleteCustomerDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                customer={customerToDelete}
                isDeleting={!!deletingId}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}