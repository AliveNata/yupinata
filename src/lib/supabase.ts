// Lightweight drop-in for the small slice of the Supabase query builder this app
// uses. Data now comes from our own read-only API (Express + PostgreSQL on the
// VPS) instead of Supabase; media is served as static files under /media.
// Only this file changed - every component keeps calling `supabase.from(...)`.

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') // '' = same-origin (/api/...)

// Whole small tables are fetched once and cached, then filtered client-side.
const cache: Record<string, Promise<any[]>> = {}
function loadTable(table: string): Promise<any[]> {
  if (!cache[table]) {
    cache[table] = fetch(`${API_BASE}/api/${table}`)
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
  }
  return cache[table]
}

type Result<T = any> = { data: T; error: { message: string } | null }

class Query implements PromiseLike<Result> {
  private table: string
  private tests: Array<(row: any) => boolean> = []
  private orderKey: string | null = null
  private orderAsc = true
  private one: 'single' | 'maybe' | null = null
  constructor(table: string) { this.table = table }

  select(_columns?: string) { return this }               // projection ignored (rows carry all fields)
  eq(col: string, val: any) { this.tests.push((r) => r[col] === val); return this }
  in(col: string, vals: any[]) { this.tests.push((r) => vals.includes(r[col])); return this }
  order(col: string, opts?: { ascending?: boolean }) { this.orderKey = col; this.orderAsc = opts?.ascending !== false; return this }
  single() { this.one = 'single'; return this }
  maybeSingle() { this.one = 'maybe'; return this }

  private async run(): Promise<Result> {
    let rows = await loadTable(this.table)
    for (const t of this.tests) rows = rows.filter(t)
    if (this.orderKey) {
      const k = this.orderKey, dir = this.orderAsc ? 1 : -1
      rows = [...rows].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir)
    }
    if (this.one) {
      const data = rows[0] ?? null
      return { data, error: this.one === 'single' && !data ? { message: 'No rows found' } : null }
    }
    return { data: rows, error: null }
  }

  then<R1 = Result, R2 = never>(onFulfilled?: ((v: Result) => R1 | PromiseLike<R1>) | null, onRejected?: ((e: any) => R2 | PromiseLike<R2>) | null): Promise<R1 | R2> {
    return this.run().then(onFulfilled, onRejected)
  }
}

export const supabase = { from: (table: string) => new Query(table) }
