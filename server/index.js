import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './auth.js'
import { crudRouter, RESOURCES } from './crud.js'
import { uploadRouter, UPLOAD_DIR } from './upload.js'

const app = express()
app.set('trust proxy', 1)
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// Admin-uploaded media (nginx also serves this path in production).
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d' }))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
for (const [table, cfg] of Object.entries(RESOURCES)) {
  app.use(`/api/${table}`, crudRouter(table, cfg))
}
app.use('/api/upload', uploadRouter)

app.use((err, _req, res, _next) => {
  console.error('[yupinata-api]', err.message)
  const client = /not allowed|no file|file type/i.test(err.message || '')
  res.status(client ? 400 : 500).json({ error: client ? err.message : 'Server error' })
})

const port = process.env.PORT || 4100
app.listen(port, () => console.log(`yupinata API on :${port}`))
