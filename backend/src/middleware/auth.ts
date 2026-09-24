import type { NextFunction, Request, Response } from 'express';
import { queryOne } from '../config/db.js';
import { HttpError } from '../lib/http-error.js';
import { verifyToken } from '../lib/jwt.js';

export interface AuthUser {
  id: number;
  name: string;
  phone: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next(new HttpError(401, 'UNAUTHORIZED'));

  let userId: number;
  try {
    userId = verifyToken(token).sub;
  } catch {
    return next(new HttpError(401, 'UNAUTHORIZED'));
  }

  try {
    // Foydalanuvchi o'chirilgan bo'lsa token ham ishlamasligi uchun bazadan tekshiramiz.
    const user = await queryOne<AuthUser>('SELECT id, name, phone FROM users WHERE id = $1', [userId]);
    if (!user) return next(new HttpError(401, 'UNAUTHORIZED'));
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
