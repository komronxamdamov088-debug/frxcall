export type ClientStatus = 'waiting' | 'confirmed' | 'cancelled';

export interface User {
  id: number;
  name: string;
  phone: string;
  created_at?: string;
  last_login_at?: string | null;
}

export interface Client {
  id: number;
  full_name: string;
  phone: string;
  service: string | null;
  note: string | null;
  status: ClientStatus;
  cancel_reason: string | null;
  created_by_name: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  full_name: string;
  phone: string;
  service: string;
  note: string;
  status: ClientStatus;
  cancel_reason: string;
}

export type Stats = Record<ClientStatus | 'all', number>;
