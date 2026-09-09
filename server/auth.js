import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from './db.js'

const TOKEN_TTL = '7d'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET) } catch { return res.status(401).json({ error: 'Invalid or expired token' }) }
  const { rows } = await query('SELECT token_version FROM admins WHERE id = $1', [payload.sub])
  if (!rows[0] || rows[0].token_version !== payload.tv) return res.status(401).json({ error: 'Session ended' })
  req.user = payload
  next()
}

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' })
  const { rows } = await query('SELECT id, username, password_hash FROM admins WHERE username = $1', [String(username).toLowerCase().trim()])
  const user = rows[0]
  const ok = user ? await bcrypt.compare(password, user.password_hash) : await bcrypt.compare(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinv')
  if (!user || !ok) return res.status(401).json({ error: 'Wrong username or password' })
  const bumped = await query('UPDATE admins SET token_version = token_version + 1 WHERE id = $1 RETURNING token_version', [user.id])
  const token = jwt.sign({ sub: user.id, username: user.username, tv: bumped.rows[0].token_version }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL })
  res.json({ token, username: user.username })
})

authRouter.get('/me', requireAuth, (req, res) => res.json({ username: req.user.username }))
