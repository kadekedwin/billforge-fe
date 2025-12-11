import type { Business } from "../businesses/types";

export interface ReceiptData {
    id: number;
    uuid: string;
    business_uuid: string;
    template_id: number;
    qrcode_data: string | null;
    footer_message: string | null;
    include_image: boolean;
    transaction_prefix: string | null;
    transaction_next_number: number;
    created_at: string;
    updated_at: string;
    business?: Business;
}

export interface CreateReceiptDataRequest {
    business_uuid: string;
    template_id?: number;
    qrcode_data?: string | null;
    footer_message?: string | null;
    include_image?: boolean;
    transaction_prefix?: string | null;
    transaction_next_number?: number;
}

export interface UpdateReceiptDataRequest {
    template_id?: number;
    qrcode_data?: string | null;
    footer_message?: string | null;
    include_image?: boolean;
    transaction_prefix?: string | null;
    transaction_next_number?: number;
}

export interface UpdateTransactionNumberRequest {
    transaction_next_number: number;
}
