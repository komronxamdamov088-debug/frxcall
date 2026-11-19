import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../../config/db.js';
import { HttpError } from '../../lib/http-error.js';

const DIRECTIONS = ['in', 'out'] as const;
const OUTCOMES = ['answered', 'no_answer', 'busy', 'callback'] as const;
const CALL_TYPES = ['lead', 'support', 'complaint', 'partnership', 'other'] as const;
const CALL_STATUSES = ['new', 'handed_off', 'closed'] as const;
const LANGS = ['uz', 'ru', 'en'] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const callSchema = z.object({
  client_id: z.coerce.number().int().positive().optional().nullable(),
  caller_name: optionalText(120),
  phone: z.string().trim().min(5).max(30),
  direction: z.enum(DIRECTIONS).default('in'),
  outcome: z.enum(OUTCOMES).default('answered'),
  duration_min: z.coerce.number().min(0).max(600).default(0),
  topic: optionalText(120),
  note: optionalText(2000),
  call_type: z.enum(CALL_TYPES).default('lead'),
  biz_type: optionalText(120),
  lang: z.enum(LANGS).default('uz'),
  next_step: optionalText(300),
  status: z.enum(CALL_STATUSES).default('new'),
});

const idSchema = z.coerce.number().int().positive();

const SELECT = `
  SELECT c.*, u.name AS operator_name
  FROM calls c
  LEFT JOIN users u ON u.id = c.created_by`;

export const callsRouter = Router();

callsRouter.get('/', async (req, res, next) => {
  try {
    const direction = req.query.direction ? z.enum(DIRECTIONS).parse(req.query.direction) : null;
    const outcome = req.query.outcome ? z.enum(OUTCOMES).parse(req.query.outcome) : null;
    const status = req.query.status ? z.enum(CALL_STATUSES).parse(req.query.status) : null;
    const callType = req.query.call_type ? z.enum(CALL_TYPES).parse(req.query.call_type) : null;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const where: string[] = [];
    const params: string[] = [];
    if (status) {
      params.push(status);
      where.push(`c.status = $${params.length}`);
    }
    if (callType) {
      params.push(callType);
      where.push(`c.call_type = $${params.length}`);
    }
    if (direction) {
      params.push(direction);
      where.push(`c.direction = $${params.length}`);
    }
    if (outcome) {
      params.push(outcome);
      where.push(`c.outcome = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(c.caller_name ILIKE ${p} OR c.phone ILIKE ${p} OR c.topic ILIKE ${p} OR c.note ILIKE ${p} OR c.biz_type ILIKE ${p} OR c.next_step ILIKE ${p})`);
    }
    const sql = `${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.created_at DESC, c.id DESC LIMIT 300`;
    res.json({ calls: await query(sql, params) });
  } catch (err) {
    next(err);
  }
});

callsRouter.get('/stats', async (_req, res, next) => {
  try {
    const totals = await queryOne<Record<string, number>>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))::int AS today,
         COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS week,
         COUNT(*) FILTER (WHERE direction = 'in')::int AS incoming,
         COUNT(*) FILTER (WHERE direction = 'out')::int AS outgoing,
         COUNT(*) FILTER (WHERE outcome = 'answered')::int AS answered,
         COUNT(*) FILTER (WHERE outcome = 'no_answer')::int AS no_answer,
         COUNT(*) FILTER (WHERE outcome = 'busy')::int AS busy,
         COUNT(*) FILTER (WHERE outcome = 'callback')::int AS callback,
         COALESCE(ROUND(AVG(duration_sec) FILTER (WHERE outcome = 'answered' AND duration_sec > 0)), 0)::int AS avg_sec
       FROM calls`
    );
    const operators = await query(
      `SELECT COALESCE(u.name, '—') AS name, COUNT(*)::int AS n,
              COUNT(*) FILTER (WHERE c.created_at >= date_trunc('day', now()))::int AS today
       FROM calls c LEFT JOIN users u ON u.id = c.created_by
       GROUP BY u.name ORDER BY n DESC`
    );
    const days = await query(
      `SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
              COUNT(c.id)::int AS n
       FROM generate_series(date_trunc('day', now()) - interval '13 days', date_trunc('day', now()), interval '1 day') d
       LEFT JOIN calls c ON date_trunc('day', c.created_at) = d
       GROUP BY d ORDER BY d`
    );
    const types = await query<{ call_type: string; n: number }>(
      'SELECT call_type, COUNT(*)::int AS n FROM calls GROUP BY call_type ORDER BY n DESC'
    );
    const statuses = await query<{ status: string; n: number }>('SELECT status, COUNT(*)::int AS n FROM calls GROUP BY status');
    const clients = await query<{ status: string; n: number }>('SELECT status, COUNT(*)::int AS n FROM clients GROUP BY status');
    res.json({ totals, operators, days, clients, types, statuses });
  } catch (err) {
    next(err);
  }
});

callsRouter.post('/', async (req, res, next) => {
  try {
    const b = callSchema.parse(req.body);
    const row = await queryOne<{ id: number }>(
      `INSERT INTO calls (client_id, caller_name, phone, direction, outcome, duration_sec, topic, note, created_by,
                          call_type, biz_type, lang, next_step, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        b.client_id ?? null,
        b.caller_name,
        b.phone,
        b.direction,
        b.outcome,
        Math.round(b.duration_min * 60),
        b.topic,
        b.note,
        req.user!.id,
        b.call_type,
        b.biz_type,
        b.lang,
        b.next_step,
        b.status,
      ]
    );
    const call = await queryOne(`${SELECT} WHERE c.id = $1`, [row!.id]);
    res.status(201).json({ call });
  } catch (err) {
    next(err);
  }
});

callsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const id = idSchema.parse(req.params.id);
    const { status } = z.object({ status: z.enum(CALL_STATUSES) }).parse(req.body);
    const found = await queryOne('SELECT id FROM calls WHERE id = $1', [id]);
    if (!found) throw new HttpError(404, 'CALL_NOT_FOUND');
    await query('UPDATE calls SET status = $1, updated_at = now() WHERE id = $2', [status, id]);
    res.json({ call: await queryOne(`${SELECT} WHERE c.id = $1`, [id]) });
  } catch (err) {
    next(err);
  }
});

callsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = idSchema.parse(req.params.id);
    const found = await queryOne('SELECT id FROM calls WHERE id = $1', [id]);
    if (!found) throw new HttpError(404, 'CALL_NOT_FOUND');
    await query('DELETE FROM calls WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
