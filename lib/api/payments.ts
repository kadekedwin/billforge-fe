import { apiClient } from "./client";
import type {
  ApiResponse,
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentQueryParams,
  MessageResponse,
} from "./types";

/**
 * Get all payments with optional filters
 */
export async function getPayments(params?: PaymentQueryParams): Promise<ApiResponse<Payment[]>> {
  return apiClient.get<Payment[]>("/payments", { params });
}

/**
 * Get a single payment by ID
 */
export async function getPayment(id: string | number): Promise<ApiResponse<Payment>> {
  return apiClient.get<Payment>(`/payments/${id}`);
}

/**
 * Create a new payment
 */
export async function createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
  return apiClient.post<Payment>("/payments", data);
}

/**
 * Update a payment
 */
export async function updatePayment(
  id: string | number,
  data: UpdatePaymentRequest
): Promise<ApiResponse<Payment>> {
  return apiClient.put<Payment>(`/payments/${id}`, data);
}

/**
 * Delete a payment
 */
export async function deletePayment(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/payments/${id}`);
}
