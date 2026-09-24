import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  sub: number;
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '30d' });
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, env.jwtSecret);
  if (typeof payload === 'string' || typeof payload.sub !== 'number') {
    throw new Error('Invalid token');
  }
  return { sub: payload.sub };
}
