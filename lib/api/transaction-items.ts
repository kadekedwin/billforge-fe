import { apiClient } from "./client";
import type {
  ApiResponse,
  TransactionItem,
  CreateTransactionItemRequest,
  UpdateTransactionItemRequest,
  TransactionItemQueryParams,
  MessageResponse,
} from "./types";

export async function getTransactionItems(
  params?: TransactionItemQueryParams
): Promise<ApiResponse<TransactionItem[]>> {
  return apiClient.get<TransactionItem[]>("/transaction-items", { params });
}

export async function getTransactionItem(
  id: string | number
): Promise<ApiResponse<TransactionItem>> {
  return apiClient.get<TransactionItem>(`/transaction-items/${id}`);
}

export async function createTransactionItem(
  data: CreateTransactionItemRequest
): Promise<ApiResponse<TransactionItem>> {
  return apiClient.post<TransactionItem>("/transaction-items", data);
}

export async function updateTransactionItem(
  id: string | number,
  data: UpdateTransactionItemRequest
): Promise<ApiResponse<TransactionItem>> {
  return apiClient.put<TransactionItem>(`/transaction-items/${id}`, data);
}

export async function deleteTransactionItem(
  id: string | number
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/transaction-items/${id}`);
}
