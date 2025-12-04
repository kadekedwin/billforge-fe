import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function handleApiError(response: Response, data: ApiErrorResponse): never {
  const message = data.data.message || "An error occurred";
  const errors = data.data.errors;

  throw new ApiError(message, response.status, errors);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

export function getValidationErrors(error: unknown): Record<string, string[]> | undefined {
  if (error instanceof ApiError) {
    return error.errors;
  }

  return undefined;
}
