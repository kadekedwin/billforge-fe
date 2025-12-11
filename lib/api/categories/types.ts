export interface Category {
  id: number;
  uuid: string;
  user_uuid: string;
  business_uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  business_uuid: string;
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

export interface CategoryQueryParams extends Record<string, string | number | boolean | undefined> {
  business_uuid?: string;
}
