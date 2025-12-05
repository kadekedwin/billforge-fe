export interface TransactionItem {
  id: number;
  uuid: string;
  transaction_uuid: string;
  name: string;
  sku: string | null;
  description: string | null;
  quantity: number;
  base_price: string;
  discount_amount: string;
  tax_amount: string;
  total_price: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionItemRequest {
  transaction_uuid: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  quantity: number;
  base_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
}

export interface UpdateTransactionItemRequest {
  transaction_uuid?: string;
  name?: string;
  sku?: string | null;
  description?: string | null;
  quantity?: number;
  base_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_price?: number;
}

export interface TransactionItemQueryParams extends Record<string, string | number | boolean | undefined> {
  transaction_uuid?: string;
}

