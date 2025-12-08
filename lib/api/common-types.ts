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