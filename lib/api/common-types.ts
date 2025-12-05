export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  data?: unknown;
}
export interface MessageResponse {
  message: string;
}
export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  image_size_bytes: number | null;
  created_at: string;
  updated_at: string;
}
