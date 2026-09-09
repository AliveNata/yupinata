import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { query } from './db.js'

const app = express()
app.set('trust proxy', 1)

// Same-origin in production (nginx proxies /api). CORS open for read-only content.
app.use(cors())

app.get('/health', (_req, res) => res.json({ ok: true }))

// Read-only content endpoints. The frontend shim fetches whole tables and
// filters client-side (tables are tiny), so these just return everything.
const TABLES = ['sections', 'images', 'songs']
for (const t of TABLES) {
  app.get(`/api/${t}`, async (_req, res, next) => {
    try {
      const { rows } = await query(`SELECT * FROM ${t} ORDER BY display_order ASC, id ASC`)
      res.json(rows)
    } catch (e) { next(e) }
  })
}

app.use((err, _req, res, _next) => { console.error('[yupinata-api]', err.message); res.status(500).json({ error: 'Server error' }) })

const port = process.env.PORT || 4100
app.listen(port, () => console.log(`yupinata API on :${port}`))
