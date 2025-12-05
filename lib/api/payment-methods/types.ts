export interface PaymentMethod {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodRequest {
  business_uuid: string;
  name: string;
}

export interface UpdatePaymentMethodRequest {
  business_uuid?: string;
  name?: string;
}

export interface PaymentMethodQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
}

