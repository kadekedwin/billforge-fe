import { apiClient } from "./client";
import type {
  ApiResponse,
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  ItemQueryParams,
  MessageResponse,
} from "./types";

/**
 * Get all items with optional filters
 */
export async function getItems(params?: ItemQueryParams): Promise<ApiResponse<Item[]>> {
  return apiClient.get<Item[]>("/items", { params });
}

/**
 * Get a single items by ID
 */
export async function getItem(id: string | number): Promise<ApiResponse<Item>> {
  return apiClient.get<Item>(`/items/${id}`);
}

/**
 * Create a new items
 */
export async function createItem(data: CreateItemRequest): Promise<ApiResponse<Item>> {
  return apiClient.post<Item>("/items", data);
}

/**
 * Update an items
 */
export async function updateItem(
  id: string | number,
  data: UpdateItemRequest
): Promise<ApiResponse<Item>> {
  return apiClient.put<Item>(`/items/${id}`, data);
}

/**
 * Delete an items
 */
export async function deleteItem(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/items/${id}`);
}
