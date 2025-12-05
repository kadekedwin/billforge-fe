import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../common-types";
import type { PaymentMethod, CreatePaymentMethodRequest, UpdatePaymentMethodRequest, PaymentMethodQueryParams } from "./types";

export type { PaymentMethod, CreatePaymentMethodRequest, UpdatePaymentMethodRequest, PaymentMethodQueryParams } from "./types";

export async function getPaymentMethods(params?: PaymentMethodQueryParams): Promise<ApiResponse<PaymentMethod[]>> {
  return apiClient.get<PaymentMethod[]>("/payment-methods", { params });
}

export async function getPaymentMethod(id: string | number): Promise<ApiResponse<PaymentMethod>> {
  return apiClient.get<PaymentMethod>(`/payment-methods/${id}`);
}

export async function createPaymentMethod(data: CreatePaymentMethodRequest): Promise<ApiResponse<PaymentMethod>> {
  return apiClient.post<PaymentMethod>("/payment-methods", data);
}

export async function updatePaymentMethod(
  id: string | number,
  data: UpdatePaymentMethodRequest
): Promise<ApiResponse<PaymentMethod>> {
  return apiClient.put<PaymentMethod>(`/payment-methods/${id}`, data);
}

export async function deletePaymentMethod(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/payment-methods/${id}`);
}

