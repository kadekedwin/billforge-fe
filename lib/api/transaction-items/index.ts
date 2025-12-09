import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type { TransactionItem, CreateTransactionItemRequest, UpdateTransactionItemRequest, TransactionItemQueryParams } from "./types";

export type { TransactionItem, CreateTransactionItemRequest, UpdateTransactionItemRequest, TransactionItemQueryParams } from "./types";

export async function getTransactionItems(params?: TransactionItemQueryParams): Promise<ApiResponse<TransactionItem[]>> {
  return apiClient.get<TransactionItem[]>("/api/transaction-items", params);
}

export async function getTransactionItem(id: string | number): Promise<ApiResponse<TransactionItem>> {
  return apiClient.get<TransactionItem>(`/api/transaction-items/${id}`);
}

export async function createTransactionItem(data: CreateTransactionItemRequest): Promise<ApiResponse<TransactionItem>> {
  return apiClient.post<TransactionItem>("/api/transaction-items", data);
}

export async function updateTransactionItem(id: string | number, data: UpdateTransactionItemRequest): Promise<ApiResponse<TransactionItem>> {
  return apiClient.put<TransactionItem>(`/api/transaction-items/${id}`, data);
}

export async function deleteTransactionItem(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/api/transaction-items/${id}`);
}

