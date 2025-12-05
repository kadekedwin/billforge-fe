import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../common-types";
import type { Item, CreateItemRequest, UpdateItemRequest, ItemQueryParams } from "./types";

export type { Item, CreateItemRequest, UpdateItemRequest, ItemQueryParams } from "./types";

export async function getItems(params?: ItemQueryParams): Promise<ApiResponse<Item[]>> {
  return apiClient.get<Item[]>("/items", { params });
}

export async function getItem(id: string | number): Promise<ApiResponse<Item>> {
  return apiClient.get<Item>(`/items/${id}`);
}

export async function createItem(data: CreateItemRequest): Promise<ApiResponse<Item>> {
  return apiClient.post<Item>("/items", data);
}

export async function updateItem(
  id: string | number,
  data: UpdateItemRequest
): Promise<ApiResponse<Item>> {
  return apiClient.put<Item>(`/items/${id}`, data);
}

export async function deleteItem(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/items/${id}`);
}

