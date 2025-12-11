import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type {
    ReceiptData,
    CreateReceiptDataRequest,
    UpdateReceiptDataRequest,
    UpdateTransactionNextNumberRequest
} from "./types";

export type {
    ReceiptData,
    CreateReceiptDataRequest,
    UpdateReceiptDataRequest,
    UpdateTransactionNextNumberRequest
} from "./types";

export async function getReceiptData(businessUuid: string): Promise<ApiResponse<ReceiptData>> {
    return apiClient.get<ReceiptData>(`/api/businesses/${businessUuid}/receipt-data`);
}

export async function createReceiptData(businessUuid: string, data: Omit<CreateReceiptDataRequest, 'business_uuid'>): Promise<ApiResponse<ReceiptData>> {
    return apiClient.post<ReceiptData>(`/api/businesses/${businessUuid}/receipt-data`, data);
}

export async function updateReceiptData(businessUuid: string, data: UpdateReceiptDataRequest): Promise<ApiResponse<ReceiptData>> {
    return apiClient.patch<ReceiptData>(`/api/businesses/${businessUuid}/receipt-data`, data);
}

export async function deleteReceiptData(businessUuid: string): Promise<ApiResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(`/api/businesses/${businessUuid}/receipt-data`);
}

export async function updateTransactionNextNumber(businessUuid: string, data: UpdateTransactionNextNumberRequest): Promise<ApiResponse<ReceiptData>> {
    return apiClient.patch<ReceiptData>(`/api/businesses/${businessUuid}/receipt-data/transaction-next-number`, data);
}
