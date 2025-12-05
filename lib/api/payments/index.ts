import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../common-types";
import type { Payment, CreatePaymentRequest, UpdatePaymentRequest, PaymentQueryParams } from "./types";

export type { Payment, CreatePaymentRequest, UpdatePaymentRequest, PaymentQueryParams } from "./types";

export async function getPayments(params?: PaymentQueryParams): Promise<ApiResponse<Payment[]>> {
  return apiClient.get<Payment[]>("/payments", { params });
}

export async function getPayment(id: string | number): Promise<ApiResponse<Payment>> {
  return apiClient.get<Payment>(`/payments/${id}`);
}

export async function createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
  return apiClient.post<Payment>("/payments", data);
}

export async function updatePayment(
  id: string | number,
  data: UpdatePaymentRequest
): Promise<ApiResponse<Payment>> {
  return apiClient.put<Payment>(`/payments/${id}`, data);
}

export async function deletePayment(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/payments/${id}`);
}

