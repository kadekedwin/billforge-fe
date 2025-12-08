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
import type { ItemTax, CreateItemTaxRequest } from "@/lib/api";

interface ItemTaxFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTax: ItemTax | null;
    formData: Omit<CreateItemTaxRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    error: string | null;
    isSubmitting: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function ItemTaxFormDialog({
                                      open,
                                      onOpenChange,
                                      editingTax,
                                      formData,
                                      formErrors,
                                      error,
                                      isSubmitting,
                                      onInputChange,
                                      onSubmit,
                                  }: ItemTaxFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <form onSubmit={onSubmit}>
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
                            <Label htmlFor="name">Tax Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="VAT, GST, Sales Tax..."
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
                                placeholder={formData.type === "percentage" ? "10" : "5.00"}
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
                            {editingTax ? "Update Tax" : "Create Tax"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}