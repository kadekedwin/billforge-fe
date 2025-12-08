"use client";

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
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { ItemDiscount, CreateItemDiscountRequest } from "@/lib/api";

interface ItemDiscountFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingDiscount: ItemDiscount | null;
    formData: Omit<CreateItemDiscountRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    error: string | null;
    isSubmitting: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function ItemDiscountFormDialog({
                                           open,
                                           onOpenChange,
                                           editingDiscount,
                                           formData,
                                           formErrors,
                                           error,
                                           isSubmitting,
                                           onInputChange,
                                           onSubmit,
                                       }: ItemDiscountFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <form onSubmit={onSubmit}>
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
                                onChange={onInputChange}
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
                                onChange={onInputChange}
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
                                onChange={onInputChange}
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
                            onClick={() => onOpenChange(false)}
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
    );
}