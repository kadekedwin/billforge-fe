"use client";

import { useState, useEffect } from "react";
import { useBusiness } from "@/contexts/business-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/api/customers";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/lib/api";

export default function CustomersPage() {
    const { selectedBusiness } = useBusiness();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<CreateCustomerRequest, 'business_uuid'>>({
        name: "",
        email: null,
        address: null,
        phone: null,
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
            const customersResponse = await getCustomers();

            if (customersResponse.success) {
                const filteredCustomers = customersResponse.data.filter(
                    (customer: Customer) => customer.business_uuid === selectedBusiness.uuid
                );
                setCustomers(filteredCustomers);
            } else {
                const errorData = customersResponse as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to load customers");
            }
        } catch (err) {
            setError("An error occurred while loading data");
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let processedValue: string | null = value;

        if ((name === "email" || name === "address" || name === "phone") && value === "") {
            processedValue = null;
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
            if (editingCustomer) {
                const updateData: UpdateCustomerRequest = {
                    business_uuid: selectedBusiness.uuid,
                    name: formData.name,
                    email: formData.email,
                    address: formData.address,
                    phone: formData.phone,
                };
                const response = await updateCustomer(editingCustomer.uuid, updateData);
                if (response.success) {
                    setCustomers((prev) =>
                        prev.map((customer) =>
                            customer.uuid === editingCustomer.uuid ? response.data : customer
                        )
                    );
                    setIsDialogOpen(false);
                    setFormData({
                        name: "",
                        email: null,
                        address: null,
                        phone: null,
                    });
                    setEditingCustomer(null);
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
                        setError("Failed to update customer");
                    }
                }
            } else {
                const createData: CreateCustomerRequest = {
                    ...formData,
                    business_uuid: selectedBusiness.uuid,
                };
                const response = await createCustomer(createData);
                if (response.success) {
                    setCustomers((prev) => [...prev, response.data]);
                    setIsDialogOpen(false);
                    setFormData({
                        name: "",
                        email: null,
                        address: null,
                        phone: null,
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
                        setError("Failed to create customer");
                    }
                }
            }
        } catch (err) {
            setError(editingCustomer ? "An error occurred while updating customer" : "An error occurred while creating customer");
            console.error("Error saving customer:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return;

        try {
            setDeletingId(customerToDelete.id);
            setError(null);
            const response = await deleteCustomer(customerToDelete.uuid);
            if (response.success) {
                setCustomers((prev) => prev.filter((customer) => customer.uuid !== customerToDelete.uuid));
                setIsDeleteDialogOpen(false);
                setCustomerToDelete(null);
            } else {
                const errorData = response as unknown as {
                    success: false;
                    message: string;
                };
                setError(errorData.message || "Failed to delete customer");
            }
        } catch (err) {
            setError("An error occurred while deleting customer");
            console.error("Error deleting customer:", err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            email: customer.email,
            address: customer.address,
            phone: customer.phone,
        });
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingCustomer(null);
            setFormData({
                name: "",
                email: null,
                address: null,
                phone: null,
            });
            setFormErrors({});
            setError(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">
                        Manage your customer information
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingCustomer ? "Edit Customer" : "Create New Customer"}</DialogTitle>
                                <DialogDescription>
                                    {editingCustomer ? "Update customer information" : "Add a new customer to your business"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                {error && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="name">Customer Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
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
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="email">Email (Optional)</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email || ""}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className={formErrors.email ? "border-destructive" : ""}
                                        />
                                        {formErrors.email && (
                                            <p className="text-sm text-destructive">{formErrors.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="phone">Phone (Optional)</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder="+1234567890"
                                            value={formData.phone || ""}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className={formErrors.phone ? "border-destructive" : ""}
                                        />
                                        {formErrors.phone && (
                                            <p className="text-sm text-destructive">{formErrors.phone}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="address">Address (Optional)</Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            placeholder="123 Main St, City, State, ZIP"
                                            value={formData.address || ""}
                                            onChange={handleInputChange}
                                            disabled={isSubmitting}
                                            className={formErrors.address ? "border-destructive" : ""}
                                            rows={3}
                                        />
                                        {formErrors.address && (
                                            <p className="text-sm text-destructive">{formErrors.address}</p>
                                        )}
                                    </div>
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
                                    {editingCustomer ? "Update Customer" : "Create Customer"}
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
                ) : customers.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center space-y-4">
                        <p className="text-lg text-muted-foreground">No customers found</p>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Customer
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email || "-"}</TableCell>
                                    <TableCell>{customer.phone || "-"}</TableCell>
                                    <TableCell>
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(customer)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(customer)}
                                                disabled={deletingId === customer.id}
                                            >
                                                {deletingId === customer.id ? (
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
                            This will permanently delete <span className="font-semibold">{customerToDelete?.name}</span>.
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
