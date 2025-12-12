import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type { RegisterRequest, LoginRequest, AuthResponse, ForgotPasswordRequest, ForgotPasswordResetRequest, ChangePasswordRequest, AccountDeletionRequest, AccountDeletionConfirmRequest } from "./types";

export type { RegisterRequest, LoginRequest, AuthResponse, ForgotPasswordRequest, ForgotPasswordResetRequest, ChangePasswordRequest, AccountDeletionRequest, AccountDeletionConfirmRequest } from "./types";

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>("/api/register", data);

    if (response.success && response.data.access_token) {
        apiClient.setToken(response.data.access_token);
    }

    return response;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>("/api/login", data);

    if (response.success && response.data.access_token) {
        apiClient.setToken(response.data.access_token);
    }

    return response;
}

export async function logout(): Promise<ApiResponse<MessageResponse>> {
    const response = await apiClient.post<MessageResponse>("/api/logout");
    apiClient.setToken(null);
    return response;
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>("/api/forgot-password", data);
}

export async function forgotPasswordReset(data: ForgotPasswordResetRequest): Promise<ApiResponse<MessageResponse>> {
    let url = "/api/forgot-password-reset";
    const params = new URLSearchParams();
    if (data.expires) params.append('expires', data.expires);
    if (data.signature) params.append('signature', data.signature);
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const { expires, signature, ...bodyData } = data;
    return apiClient.post<MessageResponse>(url, bodyData);
}

export async function changePassword(data: ChangePasswordRequest): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>("/api/change-password", data);
}

export function isAuthenticated(): boolean {
    return apiClient.getToken() !== null;
}

export function getAuthToken(): string | null {
    return apiClient.getToken();
}

export async function resendVerification(): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>("/api/email/resend-verification");
}

export async function verifyEmail(id: string, hash: string, expires?: string, signature?: string): Promise<ApiResponse<MessageResponse>> {
    let url = `api/email/verify/${id}/${hash}`;
    const params = new URLSearchParams();
    if (expires) params.append('expires', expires);
    if (signature) params.append('signature', signature);
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    return apiClient.get<MessageResponse>(url);
}

export async function requestAccountDeletion(data: AccountDeletionRequest): Promise<ApiResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>("/api/request-account-deletion", data);
}

export async function confirmAccountDeletion(data: AccountDeletionConfirmRequest): Promise<ApiResponse<MessageResponse>> {
    let url = "/api/confirm-account-deletion";
    const params = new URLSearchParams();
    if (data.expires) params.append('expires', data.expires);
    if (data.signature) params.append('signature', data.signature);
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const { expires, signature, ...bodyData } = data;
    const response = await apiClient.post<MessageResponse>(url, bodyData);

    if (response.success) {
        apiClient.setToken(null);
    }

    return response;
}