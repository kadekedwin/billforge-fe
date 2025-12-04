import { apiClient } from "./client";
import type {
  ApiResponse,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
  MessageResponse,
} from "./types";

/**
 * Get all transactions with optional filters
 */
export async function getTransactions(
  params?: TransactionQueryParams
): Promise<ApiResponse<Transaction[]>> {
  return apiClient.get<Transaction[]>("/transactions", { params });
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(id: string | number): Promise<ApiResponse<Transaction>> {
  return apiClient.get<Transaction>(`/transactions/${id}`);
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  data: CreateTransactionRequest
): Promise<ApiResponse<Transaction>> {
  return apiClient.post<Transaction>("/transactions", data);
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  id: string | number,
  data: UpdateTransactionRequest
): Promise<ApiResponse<Transaction>> {
  return apiClient.put<Transaction>(`/transactions/${id}`, data);
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  id: string | number
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/transactions/${id}`);
}
