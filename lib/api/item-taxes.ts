import { apiClient } from "./client";
import type {
  ApiResponse,
  ItemTax,
  CreateItemTaxRequest,
  UpdateItemTaxRequest,
  MessageResponse,
} from "./types";

/**
 * Get all items taxes with optional filter by item_uuid
 */
export async function getItemTaxes(itemUuid?: string): Promise<ApiResponse<ItemTax[]>> {
  const params = itemUuid ? { item_uuid: itemUuid } : undefined;
  return apiClient.get<ItemTax[]>("/item-taxes", { params });
}

/**
 * Get a single items tax by ID
 */
export async function getItemTax(id: string | number): Promise<ApiResponse<ItemTax>> {
  return apiClient.get<ItemTax>(`/item-taxes/${id}`);
}

/**
 * Create a new items tax
 */
export async function createItemTax(data: CreateItemTaxRequest): Promise<ApiResponse<ItemTax>> {
  return apiClient.post<ItemTax>("/item-taxes", data);
}

/**
 * Update an items tax
 */
export async function updateItemTax(
  id: string | number,
  data: UpdateItemTaxRequest
): Promise<ApiResponse<ItemTax>> {
  return apiClient.put<ItemTax>(`/item-taxes/${id}`, data);
}

/**
 * Delete an items tax
 */
export async function deleteItemTax(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/item-taxes/${id}`);
}
