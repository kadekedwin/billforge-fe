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

