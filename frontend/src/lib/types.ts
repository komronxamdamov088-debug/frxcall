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

export type CallDirection = 'in' | 'out';
export type CallOutcome = 'answered' | 'no_answer' | 'busy' | 'callback';
export type CallType = 'lead' | 'support' | 'complaint' | 'partnership' | 'other';
export type CallStatus = 'new' | 'handed_off' | 'closed';
export type CallLang = 'uz' | 'ru' | 'en';

export interface Call {
  id: number;
  client_id: number | null;
  caller_name: string | null;
  phone: string;
  direction: CallDirection;
  outcome: CallOutcome;
  duration_sec: number;
  topic: string | null;
  note: string | null;
  operator_name: string | null;
  call_type: CallType;
  biz_type: string | null;
  lang: CallLang;
  next_step: string | null;
  status: CallStatus;
  created_at: string;
}

export interface CallInput {
  caller_name: string;
  phone: string;
  direction: CallDirection;
  outcome: CallOutcome;
  duration_min: number;
  topic: string;
  note: string;
  call_type: CallType;
  biz_type: string;
  lang: CallLang;
  next_step: string;
  status: CallStatus;
}

export interface CallStats {
  totals: {
    total: number;
    today: number;
    week: number;
    incoming: number;
    outgoing: number;
    answered: number;
    no_answer: number;
    busy: number;
    callback: number;
    avg_sec: number;
  };
  operators: { name: string; n: number; today: number }[];
  days: { day: string; n: number }[];
  clients: { status: ClientStatus; n: number }[];
  types: { call_type: CallType; n: number }[];
  statuses: { status: CallStatus; n: number }[];
}
