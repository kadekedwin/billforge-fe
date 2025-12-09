import { apiClient } from '../client';
import type { ApiResponse } from '../common-types';
import type { User, UpdateUserRequest, UpdatePasswordRequest } from './types';

export type { User, UpdateUserRequest, UpdatePasswordRequest } from './types';

export async function getUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/api/user');
}

export async function updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/api/user', data);
}

export async function updatePassword(data: UpdatePasswordRequest): Promise<ApiResponse<null>> {
    return apiClient.put<null>('/api/user/password', data);
}

