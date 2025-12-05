export interface Business {
  id: number;
  uuid: string;
  user_uuid: string;
  name: string;
  address: string | null;
  phone: string | null;
  image_size_bytes: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
  image_size_bytes?: number | null;
}

export interface UpdateBusinessRequest {
  name?: string;
  address?: string | null;
  phone?: string | null;
  image_size_bytes?: number | null;
}

