import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../../config/db.js';
import { env } from '../../config/env.js';
import { HttpError } from '../../lib/http-error.js';
import { signToken } from '../../lib/jwt.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { requireAuth, type AuthUser } from '../../middleware/auth.js';

const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 10 * 60 * 1000;

/**
 * "+998 90 123-45-67", "901234567", "998901234567" → "+998901234567".
 * 9 xonali raqamga O'zbekiston kodi qo'shiladi.
 */
const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .transform((d) => (d.length === 9 ? `998${d}` : d))
  .refine((d) => d.length >= 9 && d.length <= 15, { message: 'Invalid phone' })
  .transform((d) => `+${d}`);

const registerSchema = z.object({
  name: z.string().trim().min(3).max(80),
  phone: phoneSchema,
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1).max(100),
});

interface UserRow extends AuthUser {
  password_hash: string;
}

async function userCount(): Promise<number> {
  return (await queryOne<{ n: number }>('SELECT COUNT(*)::int AS n FROM users'))!.n;
}

function publicUser({ id, name, phone }: AuthUser): AuthUser {
  return { id, name, phone };
}

// Parolni taxmin qilishga urinishlarni sekinlatish (xotirada, server qayta ishga tushsa tozalanadi).
const failedLogins = new Map<string, { count: number; lockedUntil: number }>();

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    if (await queryOne('SELECT 1 FROM users WHERE phone = $1', [body.phone])) {
      throw new HttpError(409, 'PHONE_TAKEN');
    }
    if ((await userCount()) >= env.maxUsers) throw new HttpError(403, 'USER_LIMIT_REACHED');

    const passwordHash = await hashPassword(body.password);
    // Hash hisoblanayotganda boshqa xodim ro'yxatdan o'tgan bo'lishi mumkin — qayta tekshiramiz.
    if ((await userCount()) >= env.maxUsers) throw new HttpError(403, 'USER_LIMIT_REACHED');

    const user = (await queryOne<AuthUser>(
      `INSERT INTO users (name, phone, password_hash, last_login_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (phone) DO NOTHING
       RETURNING id, name, phone`,
      [body.name, body.phone, passwordHash]
    ));
    if (!user) throw new HttpError(409, 'PHONE_TAKEN');

    res.status(201).json({ token: signToken(user.id), user });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const failed = failedLogins.get(phone);
    if (failed && failed.lockedUntil > Date.now()) throw new HttpError(429, 'TOO_MANY_ATTEMPTS');

    const user = await queryOne<UserRow>('SELECT id, name, phone, password_hash FROM users WHERE phone = $1', [phone]);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      const count = (failed?.count ?? 0) + 1;
      failedLogins.set(phone, {
        count: count >= MAX_FAILED_LOGINS ? 0 : count,
        lockedUntil: count >= MAX_FAILED_LOGINS ? Date.now() + LOCK_MS : 0,
      });
      throw new HttpError(401, 'INVALID_CREDENTIALS');
    }

    failedLogins.delete(phone);
    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
    res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Ro'yxatdan o'tish sahifasida "bo'sh joylar: N / 3" ni ko'rsatish uchun.
authRouter.get('/capacity', async (_req, res, next) => {
  try {
    res.json({ used: await userCount(), max: env.maxUsers });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/users', requireAuth, async (_req, res, next) => {
  try {
    const users = await query('SELECT id, name, phone, created_at, last_login_at FROM users ORDER BY id');
    res.json({ users, max: env.maxUsers });
  } catch (err) {
    next(err);
  }
});
