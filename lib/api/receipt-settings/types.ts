import type { Business } from "../businesses/types";

export interface ReceiptSettings {
    id: number;
    uuid: string;
    business_uuid: string;
    image_template_id: number | null;

    qrcode_data: string | null;
    footer_message: string | null;
    include_image: boolean;
    transaction_prefix: string | null;
    transaction_next_number: number;
    label_receipt_id: string | null;
    label_transaction_id: string | null;
    label_date: string | null;
    label_time: string | null;
    label_cashier: string | null;
    label_customer: string | null;
    label_items: string | null;
    label_subtotal: string | null;
    label_discount: string | null;
    label_tax: string | null;
    label_total: string | null;
    label_payment_method: string | null;
    label_amount_paid: string | null;
    label_change: string | null;
    created_at: string;
    updated_at: string;
    business?: Business;
}

export interface CreateReceiptSettingsRequest {
    business_uuid: string;
    image_template_id?: number | null;

    qrcode_data?: string | null;
    footer_message?: string | null;
    include_image?: boolean;
    transaction_prefix?: string | null;
    transaction_next_number?: number;
    label_receipt_id?: string | null;
    label_transaction_id?: string | null;
    label_date?: string | null;
    label_time?: string | null;
    label_cashier?: string | null;
    label_customer?: string | null;
    label_items?: string | null;
    label_subtotal?: string | null;
    label_discount?: string | null;
    label_tax?: string | null;
    label_total?: string | null;
    label_payment_method?: string | null;
    label_amount_paid?: string | null;
    label_change?: string | null;
}

export interface UpdateReceiptSettingsRequest {
    image_template_id?: number | null;

    qrcode_data?: string | null;
    footer_message?: string | null;
    include_image?: boolean;
    transaction_prefix?: string | null;
    transaction_next_number?: number;
    label_receipt_id?: string | null;
    label_transaction_id?: string | null;
    label_date?: string | null;
    label_time?: string | null;
    label_cashier?: string | null;
    label_customer?: string | null;
    label_items?: string | null;
    label_subtotal?: string | null;
    label_discount?: string | null;
    label_tax?: string | null;
    label_total?: string | null;
    label_payment_method?: string | null;
    label_amount_paid?: string | null;
    label_change?: string | null;
}

export interface UpdateTransactionNextNumberRequest {
    transaction_next_number: number;
}
