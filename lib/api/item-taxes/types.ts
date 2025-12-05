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

