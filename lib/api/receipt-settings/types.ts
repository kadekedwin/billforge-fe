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

    font: string | null;
    line_character: string | null;
    item_layout: number; // 0 for horizontal, 1 for vertical

    label_receipt_id: string | null;
    label_receipt_id_enabled: boolean;
    label_transaction_id: string | null;
    label_transaction_id_enabled: boolean;
    label_date: string | null;
    label_date_enabled: boolean;
    label_time: string | null;
    label_time_enabled: boolean;
    label_cashier: string | null;
    label_cashier_enabled: boolean;
    label_customer: string | null;
    label_customer_enabled: boolean;
    label_items: string | null;
    label_items_enabled: boolean;
    label_subtotal: string | null;
    label_subtotal_enabled: boolean;
    label_discount: string | null;
    label_discount_enabled: boolean;
    label_tax: string | null;
    label_tax_enabled: boolean;
    label_total: string | null;
    label_total_enabled: boolean;
    label_payment_method: string | null;
    label_payment_method_enabled: boolean;
    label_amount_paid: string | null;
    label_amount_paid_enabled: boolean;
    label_change: string | null;
    label_change_enabled: boolean;
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

    font?: string | null;
    line_character?: string | null;
    item_layout?: number;

    label_receipt_id?: string | null;
    label_receipt_id_enabled?: boolean;
    label_transaction_id?: string | null;
    label_transaction_id_enabled?: boolean;
    label_date?: string | null;
    label_date_enabled?: boolean;
    label_time?: string | null;
    label_time_enabled?: boolean;
    label_cashier?: string | null;
    label_cashier_enabled?: boolean;
    label_customer?: string | null;
    label_customer_enabled?: boolean;
    label_items?: string | null;
    label_items_enabled?: boolean;
    label_subtotal?: string | null;
    label_subtotal_enabled?: boolean;
    label_discount?: string | null;
    label_discount_enabled?: boolean;
    label_tax?: string | null;
    label_tax_enabled?: boolean;
    label_total?: string | null;
    label_total_enabled?: boolean;
    label_payment_method?: string | null;
    label_payment_method_enabled?: boolean;
    label_amount_paid?: string | null;
    label_amount_paid_enabled?: boolean;
    label_change?: string | null;
    label_change_enabled?: boolean;
}

export interface UpdateReceiptSettingsRequest {
    image_template_id?: number | null;

    qrcode_data?: string | null;
    footer_message?: string | null;
    include_image?: boolean;
    transaction_prefix?: string | null;
    transaction_next_number?: number;

    font?: string | null;
    line_character?: string | null;
    item_layout?: number;

    label_receipt_id?: string | null;
    label_receipt_id_enabled?: boolean;
    label_transaction_id?: string | null;
    label_transaction_id_enabled?: boolean;
    label_date?: string | null;
    label_date_enabled?: boolean;
    label_time?: string | null;
    label_time_enabled?: boolean;
    label_cashier?: string | null;
    label_cashier_enabled?: boolean;
    label_customer?: string | null;
    label_customer_enabled?: boolean;
    label_items?: string | null;
    label_items_enabled?: boolean;
    label_subtotal?: string | null;
    label_subtotal_enabled?: boolean;
    label_discount?: string | null;
    label_discount_enabled?: boolean;
    label_tax?: string | null;
    label_tax_enabled?: boolean;
    label_total?: string | null;
    label_total_enabled?: boolean;
    label_payment_method?: string | null;
    label_payment_method_enabled?: boolean;
    label_amount_paid?: string | null;
    label_amount_paid_enabled?: boolean;
    label_change?: string | null;
    label_change_enabled?: boolean;
}

export interface UpdateTransactionNextNumberRequest {
    transaction_next_number: number;
}
