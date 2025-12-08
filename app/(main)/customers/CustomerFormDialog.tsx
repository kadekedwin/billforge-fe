"use client";

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
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Customer, CreateCustomerRequest } from "@/lib/api";

interface CustomerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCustomer: Customer | null;
    formData: Omit<CreateCustomerRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    error: string | null;
    isSubmitting: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function CustomerFormDialog({
                                       open,
                                       onOpenChange,
                                       editingCustomer,
                                       formData,
                                       formErrors,
                                       error,
                                       isSubmitting,
                                       onInputChange,
                                       onSubmit,
                                   }: CustomerFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
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
                                    onChange={onInputChange}
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
                                    onChange={onInputChange}
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
                                    onChange={onInputChange}
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
                                    onChange={onInputChange}
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
                            onClick={() => onOpenChange(false)}
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
    );
}