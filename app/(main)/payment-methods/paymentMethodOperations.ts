import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "@/lib/api/payment-methods";
import type { PaymentMethod, CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from "@/lib/api";

interface CreatePaymentMethodParams {
    formData: Omit<CreatePaymentMethodRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleCreatePaymentMethod({
                                                    formData,
                                                    businessUuid,
                                                }: CreatePaymentMethodParams): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string; errors?: Record<string, string> }> {
    try {
        const response = await createPaymentMethod({
            ...formData,
            business_uuid: businessUuid,
        });

        if (!response.success) {
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
                return { success: false, errors };
            }

            return { success: false, error: errorData.message || "Failed to create payment method" };
        }

        return { success: true, paymentMethod: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while creating payment method" };
    }
}

interface UpdatePaymentMethodParams {
    paymentMethod: PaymentMethod;
    formData: Omit<CreatePaymentMethodRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleUpdatePaymentMethod({
                                                    paymentMethod,
                                                    formData,
                                                    businessUuid,
                                                }: UpdatePaymentMethodParams): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string; errors?: Record<string, string> }> {
    try {
        const updateData: UpdatePaymentMethodRequest = {
            business_uuid: businessUuid,
            name: formData.name,
        };

        const response = await updatePaymentMethod(paymentMethod.uuid, updateData);

        if (!response.success) {
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
                return { success: false, errors };
            }

            return { success: false, error: errorData.message || "Failed to update payment method" };
        }

        return { success: true, paymentMethod: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while updating payment method" };
    }
}

export async function handleDeletePaymentMethod(paymentMethod: PaymentMethod): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await deletePaymentMethod(paymentMethod.uuid);

        if (!response.success) {
            const errorData = response as unknown as {
                success: false;
                message: string;
            };
            return { success: false, error: errorData.message || "Failed to delete payment method" };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: "An error occurred while deleting payment method" };
    }
}