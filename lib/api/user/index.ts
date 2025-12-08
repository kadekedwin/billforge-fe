import { apiClient } from '../client';
import type { ApiResponse } from '../common-types';
import type { User, UpdateUserRequest } from './types';

export type { User, UpdateUserRequest } from './types';

export async function getUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/user');
}

export async function updateUser(data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/user', data);
}

