import { neon } from '@neondatabase/serverless';
import { env } from './env.js';

const sql = neon(env.databaseUrl);

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id            SERIAL PRIMARY KEY,
     name          TEXT NOT NULL,
     phone         TEXT NOT NULL UNIQUE,
     password_hash TEXT NOT NULL,
     created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
     last_login_at TIMESTAMPTZ
   )`,
  `CREATE TABLE IF NOT EXISTS clients (
     id            SERIAL PRIMARY KEY,
     full_name     TEXT NOT NULL,
     phone         TEXT NOT NULL,
     service       TEXT,
     note          TEXT,
     status        TEXT NOT NULL DEFAULT 'waiting'
                   CHECK (status IN ('waiting', 'confirmed', 'cancelled')),
     cancel_reason TEXT,
     created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
     updated_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
     created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)`,
];

// Har bir serverless instansiya birinchi so'rovda jadvallar borligiga ishonch hosil qiladi.
let ready: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  ready ??= (async () => {
    for (const stmt of SCHEMA) await sql.query(stmt);
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  return (await sql.query(text, params)) as T[];
}

export async function queryOne<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | undefined> {
  return (await query<T>(text, params))[0];
}
