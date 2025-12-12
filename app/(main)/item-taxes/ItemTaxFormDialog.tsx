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
import { useTranslation } from "@/lib/i18n/useTranslation";

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
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogHeader>
                            <DialogTitle>{editingTax ? t('app.itemTaxes.editTitle') : t('app.itemTaxes.createTitle')}</DialogTitle>
                            <DialogDescription>
                                {editingTax ? t('app.itemTaxes.editDescription') : t('app.itemTaxes.createDescription')}
                            </DialogDescription>
                        </DialogHeader>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('app.itemTaxes.taxName')}</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t('app.itemTaxes.placeholderName')}
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
                            <Label htmlFor="type">{t('app.itemTaxes.type')}</Label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={onInputChange}
                                disabled={isSubmitting}
                                required
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${formErrors.type ? "border-destructive" : ""}`}
                            >
                                <option value="percentage">{t('app.itemTaxes.percentage')}</option>
                                <option value="fixed">{t('app.itemTaxes.fixed')}</option>
                            </select>
                            {formErrors.type && (
                                <p className="text-sm text-destructive">{formErrors.type}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="value">
                                {t('app.itemTaxes.value')} {formData.type === "percentage" ? "(%)" : "($)"}
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
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingTax ? t('app.itemTaxes.editTitle') : t('app.itemTaxes.createTitle')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}