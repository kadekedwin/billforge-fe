import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import type { User, UpdateUserRequest } from "./types";

export type { User, UpdateUserRequest } from "./types";

export async function getUser(): Promise<ApiResponse<User>> {
  return apiClient.get<User>("/api/user");
}

export async function updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
  return apiClient.put<User>("/api/user", data);
}
