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
  image_size_bytes: number | null;
  created_at: string;
  updated_at: string;
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
  image_size_bytes?: number | null;
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
  image_size_bytes?: number | null;
}

export interface ItemQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
  is_active?: boolean;
}

