import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryQueryParams } from "./types";

export type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryQueryParams } from "./types";

export async function getCategories(params?: CategoryQueryParams): Promise<ApiResponse<Category[]>> {
  return apiClient.get<Category[]>("/api/categories", params);
}

export async function getCategory(uuid: string): Promise<ApiResponse<Category>> {
  return apiClient.get<Category>(`/api/categories/${uuid}`);
}

export async function createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
  return apiClient.post<Category>("/api/categories", data);
}

export async function updateCategory(uuid: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
  return apiClient.put<Category>(`/api/categories/${uuid}`, data);
}

export async function deleteCategory(uuid: string): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/api/categories/${uuid}`);
}
