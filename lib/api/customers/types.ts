export interface Customer {
  id: number;
  uuid: string;
  business_uuid: string;
  name: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  business_uuid: string;
  name: string;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
}

export interface UpdateCustomerRequest {
  business_uuid?: string;
  name?: string;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
}

export interface CustomerQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
}

