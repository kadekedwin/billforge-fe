import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type { Category } from "@/lib/api"
import type { AttachCategoryRequest } from "./types";

export type { AttachCategoryRequest } from "./types";

export async function getItemCategories(itemUuid: string): Promise<ApiResponse<Category[]>> {
  return apiClient.get<Category[]>(`/api/items/${itemUuid}/categories`);
}

export async function attachCategoryToItem(itemUuid: string, data: AttachCategoryRequest): Promise<ApiResponse<MessageResponse>> {
  return apiClient.post<MessageResponse>(`/api/items/${itemUuid}/categories`, data);
}

export async function detachCategoryFromItem(itemUuid: string, categoryUuid: string): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/api/items/${itemUuid}/categories/${categoryUuid}`);
}
