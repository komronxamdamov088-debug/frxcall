import { Router } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../../config/db.js';
import { HttpError } from '../../lib/http-error.js';

const STATUSES = ['waiting', 'confirmed', 'cancelled'] as const;
const statusSchema = z.enum(STATUSES);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const clientSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(30),
  service: optionalText(120),
  note: optionalText(2000),
  status: statusSchema.default('waiting'),
  cancel_reason: optionalText(500),
});

const statusChangeSchema = z.object({
  status: statusSchema,
  cancel_reason: optionalText(500),
});

const idSchema = z.coerce.number().int().positive();

const SELECT = `
  SELECT c.*, cu.name AS created_by_name, uu.name AS updated_by_name
  FROM clients c
  LEFT JOIN users cu ON cu.id = c.created_by
  LEFT JOIN users uu ON uu.id = c.updated_by`;

async function getClient(id: number) {
  const row = await queryOne(`${SELECT} WHERE c.id = $1`, [id]);
  if (!row) throw new HttpError(404, 'CLIENT_NOT_FOUND');
  return row;
}

export const clientsRouter = Router();

clientsRouter.get('/', async (req, res, next) => {
  try {
    const status = req.query.status ? statusSchema.parse(req.query.status) : null;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const where: string[] = [];
    const params: string[] = [];
    if (status) {
      params.push(status);
      where.push(`c.status = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      const p = `$${params.length}`;
      where.push(`(c.full_name ILIKE ${p} OR c.phone ILIKE ${p} OR c.service ILIKE ${p} OR c.note ILIKE ${p})`);
    }

    const sql = `${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY c.updated_at DESC, c.id DESC`;
    res.json({ clients: await query(sql, params) });
  } catch (err) {
    next(err);
  }
});

clientsRouter.get('/stats', async (_req, res, next) => {
  try {
    const rows = await query<{ status: (typeof STATUSES)[number]; n: number }>(
      'SELECT status, COUNT(*)::int AS n FROM clients GROUP BY status'
    );
    const stats = { all: 0, waiting: 0, confirmed: 0, cancelled: 0 };
    for (const r of rows) {
      stats[r.status] = r.n;
      stats.all += r.n;
    }
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

clientsRouter.post('/', async (req, res, next) => {
  try {
    const b = clientSchema.parse(req.body);
    const row = await queryOne<{ id: number }>(
      `INSERT INTO clients (full_name, phone, service, note, status, cancel_reason, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id`,
      [b.full_name, b.phone, b.service, b.note, b.status, b.status === 'cancelled' ? b.cancel_reason : null, req.user!.id]
    );
    res.status(201).json({ client: await getClient(row!.id) });
  } catch (err) {
    next(err);
  }
});

clientsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = idSchema.parse(req.params.id);
    await getClient(id);
    const b = clientSchema.parse(req.body);
    await query(
      `UPDATE clients SET full_name = $1, phone = $2, service = $3, note = $4, status = $5, cancel_reason = $6,
         updated_by = $7, updated_at = now()
       WHERE id = $8`,
      [b.full_name, b.phone, b.service, b.note, b.status, b.status === 'cancelled' ? b.cancel_reason : null, req.user!.id, id]
    );
    res.json({ client: await getClient(id) });
  } catch (err) {
    next(err);
  }
});

clientsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const id = idSchema.parse(req.params.id);
    await getClient(id);
    const b = statusChangeSchema.parse(req.body);
    await query(
      'UPDATE clients SET status = $1, cancel_reason = $2, updated_by = $3, updated_at = now() WHERE id = $4',
      [b.status, b.status === 'cancelled' ? b.cancel_reason : null, req.user!.id, id]
    );
    res.json({ client: await getClient(id) });
  } catch (err) {
    next(err);
  }
});

clientsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = idSchema.parse(req.params.id);
    await getClient(id);
    await query('DELETE FROM clients WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
