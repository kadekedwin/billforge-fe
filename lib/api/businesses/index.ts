import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../common-types";
import type { Business, CreateBusinessRequest, UpdateBusinessRequest } from "./types";

export type { Business, CreateBusinessRequest, UpdateBusinessRequest } from "./types";

export async function getBusinesses(): Promise<ApiResponse<Business[]>> {
  return apiClient.get<Business[]>("/api/businesses");
}

export async function getBusiness(id: string | number): Promise<ApiResponse<Business>> {
  return apiClient.get<Business>(`/api/businesses/${id}`);
}

export async function createBusiness(data: CreateBusinessRequest): Promise<ApiResponse<Business>> {
  return apiClient.post<Business>("/api/businesses", data);
}

export async function updateBusiness(
  id: string | number,
  data: UpdateBusinessRequest
): Promise<ApiResponse<Business>> {
  return apiClient.put<Business>(`/api/businesses/${id}`, data);
}

export async function deleteBusiness(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/api/businesses/${id}`);
}

