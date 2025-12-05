import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../common-types";
import type { ItemTax, CreateItemTaxRequest, UpdateItemTaxRequest } from "./types";

export type { ItemTax, CreateItemTaxRequest, UpdateItemTaxRequest } from "./types";

export async function getItemTaxes(businessUuid?: string): Promise<ApiResponse<ItemTax[]>> {
  const params = businessUuid ? { business_uuid: businessUuid } : undefined;
  return apiClient.get<ItemTax[]>("/item-taxes", { params });
}

export async function getItemTax(id: string | number): Promise<ApiResponse<ItemTax>> {
  return apiClient.get<ItemTax>(`/item-taxes/${id}`);
}

export async function createItemTax(data: CreateItemTaxRequest): Promise<ApiResponse<ItemTax>> {
  return apiClient.post<ItemTax>("/item-taxes", data);
}

export async function updateItemTax(
  id: string | number,
  data: UpdateItemTaxRequest
): Promise<ApiResponse<ItemTax>> {
  return apiClient.put<ItemTax>(`/item-taxes/${id}`, data);
}

export async function deleteItemTax(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/item-taxes/${id}`);
}

