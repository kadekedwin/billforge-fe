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

