import { apiClient } from "../client";
import type { ApiResponse, MessageResponse } from "../types";
import type {
    PrinterSettings,
    CreatePrinterSettingsRequest,
    UpdatePrinterSettingsRequest
} from "./types";

export type {
    PrinterSettings,
    CreatePrinterSettingsRequest,
    UpdatePrinterSettingsRequest
} from "./types";

export async function getPrinterSettings(businessUuid: string): Promise<ApiResponse<PrinterSettings>> {
    return apiClient.get<PrinterSettings>(`/api/businesses/${businessUuid}/printer-settings`);
}

export async function createPrinterSettings(businessUuid: string, data: CreatePrinterSettingsRequest): Promise<ApiResponse<PrinterSettings>> {
    return apiClient.post<PrinterSettings>(`/api/businesses/${businessUuid}/printer-settings`, data);
}

export async function updatePrinterSettings(businessUuid: string, data: UpdatePrinterSettingsRequest): Promise<ApiResponse<PrinterSettings>> {
    return apiClient.patch<PrinterSettings>(`/api/businesses/${businessUuid}/printer-settings`, data);
}

export async function deletePrinterSettings(businessUuid: string): Promise<ApiResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(`/api/businesses/${businessUuid}/printer-settings`);
}
