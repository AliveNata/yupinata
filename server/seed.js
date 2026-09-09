import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'node:url'
import { pool, query } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data.json'), 'utf8'))

const COLUMNS = {
  sections: ['id', 'name', 'title', 'content', 'profiles', 'display_order', 'created_at', 'updated_at'],
  images: ['id', 'section', 'path', 'description', 'display_order', 'created_at', 'updated_at'],
  songs: ['id', 'title', 'artist', 'album', 'cover_url', 'audio_url', 'lyrics', 'display_order', 'created_at', 'updated_at'],
}
const JSON_COLS = new Set(['profiles'])

async function seedTable(table, rows) {
  const cols = COLUMNS[table]
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ')
  const updates = cols.filter((c) => c !== 'id').map((c) => `${c} = EXCLUDED.${c}`).join(', ')
  for (const row of rows) {
    const values = cols.map((c) => (JSON_COLS.has(c) ? (row[c] == null ? null : JSON.stringify(row[c])) : row[c] ?? null))
    await query(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})
       ON CONFLICT (id) DO UPDATE SET ${updates}`,
      values,
    )
  }
  console.log(`  seeded ${table}: ${rows.length} rows`)
}

async function seedAdmin() {
  const username = (process.env.ADMIN_USER || '').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || ''
  if (!username || !password) return console.warn('! ADMIN_USER / ADMIN_PASSWORD not set - skipping admin')
  const hash = await bcrypt.hash(password, 10)
  await query(
    `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, hash],
  )
  console.log(`  admin ready: ${username}`)
}

async function run() {
  await seedAdmin()
  for (const table of ['sections', 'images', 'songs']) await seedTable(table, data[table] || [])
  console.log('Seed complete.')
  await pool.end()
}
run().catch((e) => { console.error('Seed failed:', e.message); process.exit(1) })
