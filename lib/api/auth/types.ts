import type { User } from "../user/types";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}


export interface ResetPasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface PasswordResetRequest {
    current_password: string;
    password: string;
    password_confirmation: string;
}
