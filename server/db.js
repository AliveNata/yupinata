import 'dotenv/config'
import pg from 'pg'

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
export const query = (text, params) => pool.query(text, params)
