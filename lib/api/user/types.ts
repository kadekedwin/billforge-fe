export interface User {
    id: number;
    uuid: string;
    name: string;
    email: string;
    image_size_bytes: number | null;
    created_at: string;
    updated_at: string;
}

export interface UpdateUserRequest {
    name?: string;
    image_size_bytes?: number | null;
}

export interface UpdatePasswordRequest {
    current_password: string;
    password: string;
    password_confirmation: string;
}

