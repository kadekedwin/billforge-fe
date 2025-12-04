import { apiClient } from "./client";
import type {
  ApiResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  MessageResponse,
} from "./types";

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<AuthResponse>("/register", data);

  if (response.success && response.data.access_token) {
    apiClient.setToken(response.data.access_token);
  }

  return response;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<AuthResponse>("/login", data);

  if (response.success && response.data.access_token) {
    apiClient.setToken(response.data.access_token);
  }

  return response;
}

export async function logout(): Promise<ApiResponse<MessageResponse>> {
  const response = await apiClient.post<MessageResponse>("/logout");

  apiClient.setToken(null);

  return response;
}

export function isAuthenticated(): boolean {
  return apiClient.getToken() !== null;
}

export function getAuthToken(): string | null {
  return apiClient.getToken();
}
