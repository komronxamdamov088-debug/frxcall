import type { Client, ClientInput, ClientStatus, Stats, User } from './types';

const TOKEN_KEY = 'frx_phone_token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string
  ) {
    super(code);
  }
}

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, 'NETWORK');
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    // Kod yo'q 5xx — odatda backend o'chiq va Vite proxy javob qaytargan.
    throw new ApiError(res.status, data.code ?? (res.status >= 500 ? 'NETWORK' : 'DEFAULT'));
  }
  return data as T;
}

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  register: (body: { name: string; phone: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: json(body) }),
  login: (body: { phone: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: json(body) }),
  me: () => request<{ user: User }>('/auth/me'),
  capacity: () => request<{ used: number; max: number }>('/auth/capacity'),
  users: () => request<{ users: User[]; max: number }>('/auth/users'),

  clients: (params: { status?: ClientStatus; q?: string }) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.q) qs.set('q', params.q);
    return request<{ clients: Client[] }>(`/clients?${qs}`);
  },
  stats: () => request<Stats>('/clients/stats'),
  createClient: (body: ClientInput) =>
    request<{ client: Client }>('/clients', { method: 'POST', body: json(body) }),
  updateClient: (id: number, body: ClientInput) =>
    request<{ client: Client }>(`/clients/${id}`, { method: 'PUT', body: json(body) }),
  setStatus: (id: number, status: ClientStatus, cancel_reason?: string) =>
    request<{ client: Client }>(`/clients/${id}/status`, {
      method: 'PATCH',
      body: json({ status, cancel_reason }),
    }),
  deleteClient: (id: number) => request<void>(`/clients/${id}`, { method: 'DELETE' }),
};
