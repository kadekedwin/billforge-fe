import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerQueryParams } from "./types";

export type { Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerQueryParams } from "./types";

export async function getCustomers(params?: CustomerQueryParams): Promise<ApiResponse<Customer[]>> {
  return apiClient.get<Customer[]>("/api/customers", params);
}

export async function getCustomer(id: string | number): Promise<ApiResponse<Customer>> {
  return apiClient.get<Customer>(`/api/customers/${id}`);
}

export async function createCustomer(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
  return apiClient.post<Customer>("/api/customers", data);
}

export async function updateCustomer(id: string | number, data: UpdateCustomerRequest): Promise<ApiResponse<Customer>> {
  return apiClient.put<Customer>(`/api/customers/${id}`, data);
}

export async function deleteCustomer(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/api/customers/${id}`);
}

