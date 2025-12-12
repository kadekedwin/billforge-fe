import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/lib/api";

interface CreateCustomerParams {
    formData: Omit<CreateCustomerRequest, 'business_uuid'>;
    businessUuid: string;
    t: (key: string) => string;
}

export async function handleCreateCustomer({
    formData,
    businessUuid,
    t,
}: CreateCustomerParams): Promise<{ success: boolean; customer?: Customer; error?: string; errors?: Record<string, string> }> {
    try {
        const createData: CreateCustomerRequest = {
            ...formData,
            business_uuid: businessUuid,
        };

        const response = await createCustomer(createData);

        return { success: true, customer: response.data };
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
        return { success: false, error: t('app.customers.errorCreating') };
    }
}

interface UpdateCustomerParams {
    customer: Customer;
    formData: Omit<CreateCustomerRequest, 'business_uuid'>;
    businessUuid: string;
    t: (key: string) => string;
}

export async function handleUpdateCustomer({
    customer,
    formData,
    businessUuid,
    t,
}: UpdateCustomerParams): Promise<{ success: boolean; customer?: Customer; error?: string; errors?: Record<string, string> }> {
    try {
        const updateData: UpdateCustomerRequest = {
            business_uuid: businessUuid,
            name: formData.name,
            email: formData.email,
            address: formData.address,
            phone: formData.phone,
        };

        const response = await updateCustomer(customer.uuid, updateData);

        return { success: true, customer: response.data };
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
        return { success: false, error: t('app.customers.errorUpdating') };
    }
}

export async function handleDeleteCustomer(customer: Customer, t: (key: string) => string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteCustomer(customer.uuid);

        return { success: true };
    } catch (err) {
        if (err instanceof ApiError) {
            return { success: false, error: err.message };
        }
        return { success: false, error: t('app.customers.errorDeleting') };
    }
}
