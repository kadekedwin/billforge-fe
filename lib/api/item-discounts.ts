import { apiClient } from "./client";
import type {
  ApiResponse,
  ItemDiscount,
  CreateItemDiscountRequest,
  UpdateItemDiscountRequest,
  MessageResponse,
} from "./types";

/**
 * Get all items discounts with optional filter by item_uuid
 */
export async function getItemDiscounts(itemUuid?: string): Promise<ApiResponse<ItemDiscount[]>> {
  const params = itemUuid ? { item_uuid: itemUuid } : undefined;
  return apiClient.get<ItemDiscount[]>("/item-discounts", { params });
}

/**
 * Get a single items discount by ID
 */
export async function getItemDiscount(id: string | number): Promise<ApiResponse<ItemDiscount>> {
  return apiClient.get<ItemDiscount>(`/item-discounts/${id}`);
}

/**
 * Create a new items discount
 */
export async function createItemDiscount(
  data: CreateItemDiscountRequest
): Promise<ApiResponse<ItemDiscount>> {
  return apiClient.post<ItemDiscount>("/item-discounts", data);
}

/**
 * Update an items discount
 */
export async function updateItemDiscount(
  id: string | number,
  data: UpdateItemDiscountRequest
): Promise<ApiResponse<ItemDiscount>> {
  return apiClient.put<ItemDiscount>(`/item-discounts/${id}`, data);
}

/**
 * Delete an items discount
 */
export async function deleteItemDiscount(
  id: string | number
): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/item-discounts/${id}`);
}
