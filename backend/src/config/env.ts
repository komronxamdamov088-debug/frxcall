import 'dotenv/config';

function list(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  databaseUrl: process.env.DATABASE_URL ?? '',
  corsOrigins: list(process.env.CORS_ORIGINS),
  // Tizimga faqat shuncha xodim ro'yxatdan o'ta oladi.
  maxUsers: Number(process.env.MAX_USERS ?? 3),
  isProd: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is not set (Neon Postgres connection string)');
}

if (env.isProd && env.jwtSecret === 'dev-secret-change-me') {
  throw new Error('JWT_SECRET must be set in production');
}
