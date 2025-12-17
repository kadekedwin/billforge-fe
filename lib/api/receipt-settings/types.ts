import type { Business } from "../businesses/types";

export interface ReceiptSettings {
    id: number;
    uuid: string;
    business_uuid: string;
    image_template_id: number;
    print_template_id: number;
    qrcode_data: string | null;
    footer_message: string | null;
    include_image: boolean;
    transaction_prefix: string | null;
    transaction_next_number: number;
    created_at: string;
    updated_at: string;
    business?: Business;
}

export interface CreateReceiptSettingsRequest {
    business_uuid: string;
    image_template_id?: number;
    print_template_id?: number;
    qrcode_data?: string | null;
    footer_message?: string | null;
    include_image?: boolean;
    transaction_prefix?: string | null;
    transaction_next_number?: number;
}

export interface UpdateReceiptSettingsRequest {
    image_template_id?: number;
    print_template_id?: number;
    qrcode_data?: string | null;
    footer_message?: string | null;
    include_image?: boolean;
    transaction_prefix?: string | null;
    transaction_next_number?: number;
}

export interface UpdateTransactionNextNumberRequest {
    transaction_next_number: number;
}
