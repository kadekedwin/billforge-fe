export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  data: {
    message?: string;
    errors?: Record<string, string[]>;
  };
}

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface Business {
  id: number;
  uuid: string;
  user_uuid: string;
  name: string;
  address: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessRequest {
  name: string;
  address: string;
  phone: string;
}

export interface UpdateBusinessRequest {
  name?: string;
  address?: string;
  phone?: string;
}

export interface ItemTax {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  rate: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItemTaxRequest {
  business_uuid: string;
  name: string;
  rate: number;
}

export interface UpdateItemTaxRequest {
  name?: string;
  rate?: number;
}

export interface ItemDiscount {
  id: number;
  uuid: string;
  business_uuid: string;
  type: "percentage" | "fixed";
  value: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItemDiscountRequest {
  business_uuid: string;
  type: "percentage" | "fixed";
  value: number;
  start_date: string;
  end_date: string;
}

export interface UpdateItemDiscountRequest {
  type?: "percentage" | "fixed";
  value?: number;
  start_date?: string;
  end_date?: string;
}

export interface Item {
  id: number;
  uuid: string;
  business_uuid: string;
  discount_uuid: string;
  tax_uuid: string;
  name: string;
  sku: string;
  description: string;
  base_price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tax: {
    id: number;
    uuid: string;
    business_uuid: string;
    name: string;
    rate: string;
  };
  discount: {
    id: number;
    uuid: string;
    business_uuid: string;
    type: string;
    value: string;
  };
}

export interface CreateItemRequest {
  business_uuid: string;
  discount_uuid: string;
  tax_uuid: string;
  name: string;
  sku: string;
  description: string;
  base_price: number;
  is_active: boolean;
}

export interface UpdateItemRequest {
  name?: string;
  sku?: string;
  description?: string;
  base_price?: number;
  is_active?: boolean;
}

export interface ItemQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
  is_active?: boolean;
}

export interface Transaction {
  id: number;
  uuid: string;
  business_uuid: string;
  payment_uuid: string;
  customer_name: string;
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
  payment_uuid: string;
  customer_name: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  status: "pending" | "paid" | "cancelled";
}

export interface UpdateTransactionRequest {
  customer_name?: string;
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

export interface TransactionItem {
  id: number;
  uuid: string;
  transaction_uuid: string;
  item_uuid: string;
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
  item_uuid: string;
  quantity: number;
  base_price: number;
  discount_amount: number;
  tax_amount: number;
  total_price: number;
}

export interface UpdateTransactionItemRequest {
  quantity?: number;
  base_price?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_price?: number;
}

export interface TransactionItemQueryParams extends Record<string, string | number | boolean | undefined> {
  transaction_uuid?: string;
  item_uuid?: string;
}

export interface Payment {
  id: number;
  uuid: string;
  business_uuid: string;
  method: string;
  amount: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  business_uuid: string;
  method: string;
  amount: number;
  paid_at: string;
}

export interface UpdatePaymentRequest {
  method?: string;
  amount?: number;
  paid_at?: string;
}

export interface PaymentQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
  method?: string;
}

export interface MessageResponse {
  message: string;
}
