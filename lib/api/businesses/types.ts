export interface Business {
  id: number;
  uuid: string;
  user_uuid: string;
  name: string;
  address: string | null;
  phone: string | null;
  image_size_bytes: number | null;
  currency: string | null;
  language: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
  image_size_bytes?: number | null;
  currency?: string | null;
  language?: string | null;
  region?: string | null;
}

export interface UpdateBusinessRequest {
  name?: string;
  address?: string | null;
  phone?: string | null;
  image_size_bytes?: number | null;
  currency?: string | null;
  language?: string | null;
  region?: string | null;
}

