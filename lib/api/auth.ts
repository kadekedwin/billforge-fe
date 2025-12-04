import { apiClient } from "./client";
import type {
  ApiResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  MessageResponse,
} from "./types";

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<AuthResponse>("/register", data);

  // Set the token in the client
  if (response.success && response.data.token) {
    apiClient.setToken(response.data.token);
  }

  return response;
}

/**
 * Login a user
 */
export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const response = await apiClient.post<AuthResponse>("/login", data);

  // Set the token in the client
  if (response.success && response.data.token) {
    apiClient.setToken(response.data.token);
  }

  return response;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<ApiResponse<MessageResponse>> {
  const response = await apiClient.post<MessageResponse>("/logout");

  // Clear the token from the client
  apiClient.setToken(null);

  return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return apiClient.getToken() !== null;
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
  return apiClient.getToken();
}
