import { apiClient } from "../client";
import type { ApiResponse } from "../types";
import type {
    SalesSummary,
    SalesByDate,
    SalesByItem,
    SalesByCategory,
    SalesByPaymentMethod,
    ReportFilters
} from "./types";

export type {
    SalesSummary,
    SalesByDate,
    SalesByItem,
    SalesByCategory,
    SalesByPaymentMethod,
    ReportFilters
} from "./types";

function buildQueryString(filters: ReportFilters): string {
    const params = new URLSearchParams();
    params.append('business_uuid', filters.business_uuid);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    return params.toString();
}

export async function getSalesSummary(filters: ReportFilters): Promise<ApiResponse<SalesSummary>> {
    const queryString = buildQueryString(filters);
    return apiClient.get<SalesSummary>(`/api/reports/sales-summary?${queryString}`);
}

export async function getSalesByDate(filters: ReportFilters): Promise<ApiResponse<SalesByDate[]>> {
    const queryString = buildQueryString(filters);
    return apiClient.get<SalesByDate[]>(`/api/reports/sales-by-date?${queryString}`);
}

export async function getSalesByItem(filters: ReportFilters): Promise<ApiResponse<SalesByItem[]>> {
    const queryString = buildQueryString(filters);
    return apiClient.get<SalesByItem[]>(`/api/reports/sales-by-item?${queryString}`);
}

export async function getSalesByCategory(filters: ReportFilters): Promise<ApiResponse<SalesByCategory[]>> {
    const queryString = buildQueryString(filters);
    return apiClient.get<SalesByCategory[]>(`/api/reports/sales-by-category?${queryString}`);
}

export async function getSalesByPaymentMethod(filters: ReportFilters): Promise<ApiResponse<SalesByPaymentMethod[]>> {
    const queryString = buildQueryString(filters);
    return apiClient.get<SalesByPaymentMethod[]>(`/api/reports/sales-by-payment-method?${queryString}`);
}
