import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type {
    ReceiptSettings,
    CreateReceiptSettingsRequest,
    UpdateReceiptSettingsRequest,
    UpdateTransactionNextNumberRequest
} from "./types";

export type {
    ReceiptSettings,
    CreateReceiptSettingsRequest,
    UpdateReceiptSettingsRequest,
    UpdateTransactionNextNumberRequest
} from "./types";

export async function getReceiptSettings(businessUuid: string): Promise<ApiResponse<ReceiptSettings>> {
    return apiClient.get<ReceiptSettings>(`/api/businesses/${businessUuid}/receipt-settings`);
}

export async function createReceiptSettings(businessUuid: string, data: Omit<CreateReceiptSettingsRequest, 'business_uuid'>): Promise<ApiResponse<ReceiptSettings>> {
    return apiClient.post<ReceiptSettings>(`/api/businesses/${businessUuid}/receipt-settings`, data);
}

export async function updateReceiptSettings(businessUuid: string, data: UpdateReceiptSettingsRequest): Promise<ApiResponse<ReceiptSettings>> {
    return apiClient.patch<ReceiptSettings>(`/api/businesses/${businessUuid}/receipt-settings`, data);
}

export async function deleteReceiptSettings(businessUuid: string): Promise<ApiResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(`/api/businesses/${businessUuid}/receipt-settings`);
}

export async function updateTransactionNextNumber(businessUuid: string, data: UpdateTransactionNextNumberRequest): Promise<ApiResponse<ReceiptSettings>> {
    return apiClient.patch<ReceiptSettings>(`/api/businesses/${businessUuid}/receipt-settings/transaction-next-number`, data);
}
