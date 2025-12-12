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
import { useTranslation } from "@/lib/i18n/useTranslation";

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
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{editingCustomer ? t('app.customers.editTitle') : t('app.customers.createTitle')}</DialogTitle>
                        <DialogDescription>
                            {editingCustomer ? t('app.customers.editDescription') : t('app.customers.createDescription')}
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
                                <Label htmlFor="name">{t('app.customers.customerName')}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder={t('app.customers.placeholderName')}
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
                                <Label htmlFor="email">{t('app.customers.emailOptional')}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={t('app.customers.placeholderEmail')}
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
                                <Label htmlFor="phone">{t('app.customers.phoneOptional')}</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder={t('app.customers.placeholderPhone')}
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
                                <Label htmlFor="address">{t('app.customers.addressOptional')}</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    placeholder={t('app.customers.placeholderAddress')}
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
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingCustomer ? t('app.customers.editCustomer') : t('app.customers.addCustomer')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}