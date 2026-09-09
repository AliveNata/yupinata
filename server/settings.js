import { Router } from 'express'
import { query } from './db.js'
import { requireAuth } from './auth.js'

export const settingsRouter = Router()

// Public: all settings rows (site_title, favicon_url, ...).
settingsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT key, value FROM settings ORDER BY key')
    res.json(rows)
  } catch (e) { next(e) }
})

// Auth: upsert one setting by key.
settingsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const { key, value } = req.body || {}
    if (!key) return res.status(400).json({ error: 'key required' })
    const { rows } = await query(
      `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
       RETURNING key, value`,
      [key, value ?? null],
    )
    res.status(201).json(rows[0])
  } catch (e) { next(e) }
})
