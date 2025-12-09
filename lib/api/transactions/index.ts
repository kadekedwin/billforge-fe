import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../common-types";
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionQueryParams } from "./types";

export type { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionQueryParams } from "./types";

export async function getTransactions(
  params?: TransactionQueryParams
): Promise<ApiResponse<Transaction[]>> {
  return apiClient.get<Transaction[]>("/api/transactions", { params });
}

export async function getTransaction(id: string | number): Promise<ApiResponse<Transaction>> {
  return apiClient.get<Transaction>(`/api/transactions/${id}`);
}

export async function createTransaction(
  data: CreateTransactionRequest
): Promise<ApiResponse<Transaction>> {
  return apiClient.post<Transaction>("/api/transactions", data);
}

export async function updateTransaction(
  id: string | number,
  data: UpdateTransactionRequest
): Promise<ApiResponse<Transaction>> {
  return apiClient.put<Transaction>(`/api/transactions/${id}`, data);
}

export async function deleteTransaction(
  id: string | number
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/api/transactions/${id}`);
}

