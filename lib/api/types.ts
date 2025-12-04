export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  data?: unknown;
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
  user: User;
  access_token: string;
  token_type: string;
}

export interface Business {
  id: number;
  uuid: string;
  user_uuid: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
}

export interface UpdateBusinessRequest {
  name?: string;
  address?: string | null;
  phone?: string | null;
}

export interface ItemTax {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  type: "percentage" | "fixed";
  value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItemTaxRequest {
  business_uuid: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
}

export interface UpdateItemTaxRequest {
  business_uuid?: string;
  name?: string;
  type?: "percentage" | "fixed";
  value?: number;
}

export interface ItemDiscount {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  type: "percentage" | "fixed";
  value: string;
  created_at: string;
  updated_at: string;
}

export interface CreateItemDiscountRequest {
  business_uuid: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
}

export interface UpdateItemDiscountRequest {
  business_uuid?: string;
  name?: string;
  type?: "percentage" | "fixed";
  value?: number;
}

export interface Item {
  id: number;
  uuid: string;
  business_uuid: string;
  discount_uuid: string | null;
  tax_uuid: string | null;
  name: string;
  sku: string | null;
  description: string | null;
  base_price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tax: {
    id: number;
    uuid: string;
    business_uuid: string;
    name: string;
    type: string;
    value: string;
  } | null;
  discount: {
    id: number;
    uuid: string;
    business_uuid: string;
    name: string;
    type: string;
    value: string;
  } | null;
}

export interface CreateItemRequest {
  business_uuid: string;
  discount_uuid?: string | null;
  tax_uuid?: string | null;
  name: string;
  sku?: string | null;
  description?: string | null;
  base_price: number;
  is_active: boolean;
}

export interface UpdateItemRequest {
  business_uuid?: string;
  discount_uuid?: string | null;
  tax_uuid?: string | null;
  name?: string;
  sku?: string | null;
  description?: string | null;
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
  payment_uuid: string | null;
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
  payment_uuid?: string | null;
  customer_name?: string | null;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  status: "pending" | "paid" | "cancelled";
}

export interface UpdateTransactionRequest {
  business_uuid?: string;
  payment_uuid?: string | null;
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
  transaction_uuid?: string;
  item_uuid?: string;
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
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  business_uuid: string;
  method: string;
  amount: number;
  paid_at?: string | null;
}

export interface UpdatePaymentRequest {
  business_uuid?: string;
  method?: string;
  amount?: number;
  paid_at?: string | null;
}

export interface PaymentQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
  method?: string;
}

export interface MessageResponse {
  message: string;
}
