import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import { authRouter } from './modules/auth/auth.router.js';
import { clientsRouter } from './modules/clients/clients.router.js';
import { callsRouter } from './modules/calls/calls.router.js';

export const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: env.corsOrigins.length > 0 ? env.corsOrigins : true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/clients', requireAuth, clientsRouter);
app.use('/api/calls', requireAuth, callsRouter);

app.use(errorHandler);

// Vercel Express runtime default export kutadi.
export default app;
