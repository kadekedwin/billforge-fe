import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../common-types";
import type { ItemDiscount, CreateItemDiscountRequest, UpdateItemDiscountRequest } from "./types";

export type { ItemDiscount, CreateItemDiscountRequest, UpdateItemDiscountRequest } from "./types";

export async function getItemDiscounts(businessUuid?: string): Promise<ApiResponse<ItemDiscount[]>> {
  const params = businessUuid ? { business_uuid: businessUuid } : undefined;
  return apiClient.get<ItemDiscount[]>("/item-discounts", { params });
}

export async function getItemDiscount(id: string | number): Promise<ApiResponse<ItemDiscount>> {
  return apiClient.get<ItemDiscount>(`/item-discounts/${id}`);
}

export async function createItemDiscount(
  data: CreateItemDiscountRequest
): Promise<ApiResponse<ItemDiscount>> {
  return apiClient.post<ItemDiscount>("/item-discounts", data);
}

export async function updateItemDiscount(
  id: string | number,
  data: UpdateItemDiscountRequest
): Promise<ApiResponse<ItemDiscount>> {
  return apiClient.put<ItemDiscount>(`/item-discounts/${id}`, data);
}

export async function deleteItemDiscount(
  id: string | number
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/item-discounts/${id}`);
}

