import { Router } from 'express'
import crypto from 'node:crypto'
import { query } from './db.js'
import { requireAuth } from './auth.js'

// Columns writable per table (id/created_at/updated_at handled here).
export const RESOURCES = {
  sections: { fields: ['name', 'title', 'content', 'profiles', 'display_order'], json: ['profiles'] },
  images: { fields: ['section', 'path', 'description', 'display_order'], json: [] },
  songs: { fields: ['title', 'artist', 'album', 'cover_url', 'audio_url', 'lyrics', 'display_order'], json: [] },
}

export function crudRouter(table, { fields, json }) {
  const router = Router()
  const jsonSet = new Set(json)
  const val = (body, f) => {
    const v = body[f]
    if (jsonSet.has(f)) return v == null ? null : JSON.stringify(v)
    if (f === 'display_order') return v == null || v === '' ? 0 : Number(v)
    return v ?? null
  }

  // Public read
  router.get('/', async (_req, res, next) => {
    try { const { rows } = await query(`SELECT * FROM ${table} ORDER BY display_order ASC, id ASC`); res.json(rows) }
    catch (e) { next(e) }
  })

  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const id = crypto.randomUUID()
      const cols = ['id', ...fields, 'created_at', 'updated_at']
      const values = [id, ...fields.map((f) => val(req.body || {}, f)), new Date().toISOString(), new Date().toISOString()]
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
      const { rows } = await query(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`, values)
      res.status(201).json(rows[0])
    } catch (e) { next(e) }
  })

  router.put('/:id', requireAuth, async (req, res, next) => {
    try {
      const assignments = [...fields.map((f, i) => `${f} = $${i + 1}`), `updated_at = $${fields.length + 1}`].join(', ')
      const values = [...fields.map((f) => val(req.body || {}, f)), new Date().toISOString(), req.params.id]
      const { rows } = await query(`UPDATE ${table} SET ${assignments} WHERE id = $${fields.length + 2} RETURNING *`, values)
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (e) { next(e) }
  })

  router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
      const { rowCount } = await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id])
      if (!rowCount) return res.status(404).json({ error: 'Not found' })
      res.json({ ok: true })
    } catch (e) { next(e) }
  })

  return router
}
