import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/lib/api/payment-methods";
import { ApiError } from "@/lib/api/errors";
import type { PaymentMethod, CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from "@/lib/api";

interface CreatePaymentMethodParams {
    formData: Omit<CreatePaymentMethodRequest, 'business_uuid'>;
    businessUuid: string;
    t: (key: string) => string;
}

export async function handleCreatePaymentMethod({
    formData,
    businessUuid,
    t,
}: CreatePaymentMethodParams): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string; errors?: Record<string, string> }> {
    try {
        const response = await createPaymentMethod({
            ...formData,
            business_uuid: businessUuid,
        });

        return { success: true, paymentMethod: response.data };
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.errors) {
                const errors: Record<string, string> = {};
                Object.keys(err.errors).forEach((key) => {
                    errors[key] = err.errors![key][0];
                });
                return { success: false, errors };
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.paymentMethods.errorCreating') };
    }
}

interface UpdatePaymentMethodParams {
    paymentMethod: PaymentMethod;
    formData: Omit<CreatePaymentMethodRequest, 'business_uuid'>;
    businessUuid: string;
    t: (key: string) => string;
}

export async function handleUpdatePaymentMethod({
    paymentMethod,
    formData,
    businessUuid,
    t,
}: UpdatePaymentMethodParams): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string; errors?: Record<string, string> }> {
    try {
        const updateData: UpdatePaymentMethodRequest = {
            business_uuid: businessUuid,
            name: formData.name,
        };

        const response = await updatePaymentMethod(paymentMethod.uuid, updateData);

        return { success: true, paymentMethod: response.data };
    } catch (err) {
        if (err instanceof ApiError) {
            if (err.errors) {
                const errors: Record<string, string> = {};
                Object.keys(err.errors).forEach((key) => {
                    errors[key] = err.errors![key][0];
                });
                return { success: false, errors };
            }
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.paymentMethods.errorUpdating') };
    }
}

export async function handleDeletePaymentMethod(paymentMethod: PaymentMethod, t: (key: string) => string): Promise<{ success: boolean; error?: string }> {
    try {
        await deletePaymentMethod(paymentMethod.uuid);

        return { success: true };
    } catch (err) {
        if (err instanceof ApiError) {
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.paymentMethods.errorDeleting') };
    }
}
