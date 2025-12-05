export interface Transaction {
  id: number;
  uuid: string;
  business_uuid: string;
  payment_method_uuid: string | null;
  customer_name: string | null;
  total_amount: string;
  tax_amount: string;
  discount_amount: string;
  final_amount: string;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  business_uuid: string;
  payment_method_uuid?: string | null;
  customer_name?: string | null;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  status: "pending" | "paid" | "cancelled";
}

export interface UpdateTransactionRequest {
  business_uuid?: string;
  payment_method_uuid?: string | null;
  customer_name?: string | null;
  total_amount?: number;
  tax_amount?: number;
  discount_amount?: number;
  final_amount?: number;
  status?: "pending" | "paid" | "cancelled";
}

export interface TransactionQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
  status?: "pending" | "paid" | "cancelled";
}

