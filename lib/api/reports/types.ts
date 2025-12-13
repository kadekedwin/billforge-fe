export interface SalesSummary {
    total_transactions: number;
    total_sales: number;
    total_tax: number;
    total_discounts: number;
    average_transaction_value: number;
    total_items_sold: number;
}

export interface SalesByDate {
    date: string;
    transaction_count: number;
    total_amount: number;
}

export interface SalesByItem {
    name: string;
    sku: string;
    quantity_sold: number;
    total_revenue: number;
}

export interface SalesByCategory {
    category_name: string;
    quantity_sold: number;
    total_revenue: number;
}

export interface SalesByPaymentMethod {
    payment_method_name: string;
    transaction_count: number;
    total_amount: number;
}

export interface ReportFilters {
    business_uuid: string;
    start_date?: string;
    end_date?: string;
}
