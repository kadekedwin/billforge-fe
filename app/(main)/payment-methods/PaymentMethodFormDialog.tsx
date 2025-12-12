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
import type { PaymentMethod, CreatePaymentMethodRequest } from "@/lib/api";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface PaymentMethodFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingPaymentMethod: PaymentMethod | null;
    formData: Omit<CreatePaymentMethodRequest, 'business_uuid'>;
    formErrors: Record<string, string>;
    error: string | null;
    isSubmitting: boolean;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function PaymentMethodFormDialog({
    open,
    onOpenChange,
    editingPaymentMethod,
    formData,
    formErrors,
    error,
    isSubmitting,
    onInputChange,
    onSubmit,
}: PaymentMethodFormDialogProps) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPaymentMethod ? t('app.paymentMethods.editTitle') : t('app.paymentMethods.createTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPaymentMethod
                                ? t('app.paymentMethods.editDescription')
                                : t('app.paymentMethods.createDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('app.paymentMethods.methodName')}</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={t('app.paymentMethods.placeholderName')}
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
                            {editingPaymentMethod ? t('app.paymentMethods.editMethod') : t('app.paymentMethods.addMethod')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}