import type {ApiErrorResponse} from "./common-types";

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
  const message = data.message || "An error occurred";
  const errors = data.errors;

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      // Check if we're on an auth page first
      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath === "/login" || currentPath === "/register" || currentPath.startsWith("/login") || currentPath.startsWith("/register");

      // Only clear tokens and redirect if we're not on an auth page
      if (!isOnAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
        window.location.href = "/login";
      }
    }
  }

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
