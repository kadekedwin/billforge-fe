import { apiClient } from "./client";
import type {
  ApiResponse,
  Business,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  MessageResponse,
} from "./types";

export async function getBusinesses(): Promise<ApiResponse<Business[]>> {
  return apiClient.get<Business[]>("/businesses");
}

export async function getBusiness(id: string | number): Promise<ApiResponse<Business>> {
  return apiClient.get<Business>(`/businesses/${id}`);
}

export async function createBusiness(data: CreateBusinessRequest): Promise<ApiResponse<Business>> {
  return apiClient.post<Business>("/businesses", data);
}

export async function updateBusiness(
  id: string | number,
  data: UpdateBusinessRequest
): Promise<ApiResponse<Business>> {
  return apiClient.put<Business>(`/businesses/${id}`, data);
}

export async function deleteBusiness(id: string | number): Promise<ApiResponse<MessageResponse>> {
  return apiClient.delete<MessageResponse>(`/businesses/${id}`);
}
