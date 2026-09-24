import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http-error.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ code: err.code, message: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ code: 'VALIDATION', message: 'Validation error', issues: err.issues });
  }
  console.error(err);
  res.status(500).json({ code: 'SERVER_ERROR', message: 'Internal server error' });
}
