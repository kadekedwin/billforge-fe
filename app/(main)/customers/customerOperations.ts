import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/api/customers";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/lib/api";

interface CreateCustomerParams {
    formData: Omit<CreateCustomerRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleCreateCustomer({
                                               formData,
                                               businessUuid,
                                           }: CreateCustomerParams): Promise<{ success: boolean; customer?: Customer; error?: string; errors?: Record<string, string> }> {
    try {
        const createData: CreateCustomerRequest = {
            ...formData,
            business_uuid: businessUuid,
        };

        const response = await createCustomer(createData);

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

            return { success: false, error: errorData.message || "Failed to create customer" };
        }

        return { success: true, customer: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while creating customer" };
    }
}

interface UpdateCustomerParams {
    customer: Customer;
    formData: Omit<CreateCustomerRequest, 'business_uuid'>;
    businessUuid: string;
}

export async function handleUpdateCustomer({
                                               customer,
                                               formData,
                                               businessUuid,
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

            return { success: false, error: errorData.message || "Failed to update customer" };
        }

        return { success: true, customer: response.data };
    } catch (err) {
        return { success: false, error: "An error occurred while updating customer" };
    }
}

export async function handleDeleteCustomer(customer: Customer): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await deleteCustomer(customer.uuid);

        if (!response.success) {
            const errorData = response as unknown as {
                success: false;
                message: string;
            };
            return { success: false, error: errorData.message || "Failed to delete customer" };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: "An error occurred while deleting customer" };
    }
}