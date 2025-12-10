export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface MessageResponse {
  message: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
