// Drop-in Supabase-compatible client backed by the VPS REST API.
// Implements exactly the surface the app uses: query builder (read + write),
// auth (token based), and storage (via /api/upload). This lets the migrated
// admin and public components run unchanged.

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const TOKEN_KEY = 'yupinata-admin-token'

const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
const setToken = (t: string) => { try { localStorage.setItem(TOKEN_KEY, t) } catch { /* ignore */ } }
const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } }

function authHeaders(json = true): Record<string, string> {
  const h: Record<string, string> = {}
  if (json) h['Content-Type'] = 'application/json'
  const t = getToken()
  if (t) h.Authorization = `Bearer ${t}`
  return h
}

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`)
  return data
}

type Filter = { type: 'eq' | 'in'; col: string; val: any }
type Op = 'select' | 'insert' | 'update' | 'delete'

class Query {
  private table: string
  private op: Op = 'select'
  private payload: any = null
  private filters: Filter[] = []
  private orderCol: string | null = null
  private orderAsc = true
  private wantSingle = false
  private wantMaybe = false

  constructor(table: string) { this.table = table }

  select(_cols?: string) { if (this.op !== 'insert' && this.op !== 'update') this.op = 'select'; return this }
  insert(payload: any) { this.op = 'insert'; this.payload = payload; return this }
  upsert(payload: any) { this.op = 'insert'; this.payload = payload; return this } // server upserts by key
  update(payload: any) { this.op = 'update'; this.payload = payload; return this }
  delete() { this.op = 'delete'; return this }

  eq(col: string, val: any) { this.filters.push({ type: 'eq', col, val }); return this }
  in(col: string, val: any[]) { this.filters.push({ type: 'in', col, val }); return this }
  order(col: string, opts?: { ascending?: boolean }) { this.orderCol = col; this.orderAsc = opts?.ascending !== false; return this }
  single() { this.wantSingle = true; return this }
  maybeSingle() { this.wantMaybe = true; return this }

  private idFilter() {
    const f = this.filters.find((x) => x.col === 'id' && x.type === 'eq')
    return f ? f.val : null
  }

  private applyFilters(rows: any[]) {
    let out = rows
    for (const f of this.filters) {
      if (f.type === 'eq') out = out.filter((r) => r[f.col] === f.val)
      else if (f.type === 'in') out = out.filter((r) => f.val.includes(r[f.col]))
    }
    if (this.orderCol) {
      const col = this.orderCol
      out = [...out].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (this.orderAsc ? 1 : -1))
    }
    return out
  }

  private async run(): Promise<{ data: any; error: any }> {
    try {
      if (this.op === 'select') {
        const rows = await parse(await fetch(`${API_BASE}/api/${this.table}`))
        const filtered = this.applyFilters(rows)
        if (this.wantSingle) {
          if (!filtered[0]) throw new Error('No rows found')
          return { data: filtered[0], error: null }
        }
        if (this.wantMaybe) return { data: filtered[0] ?? null, error: null }
        return { data: filtered, error: null }
      }
      if (this.op === 'insert') {
        const rows = Array.isArray(this.payload) ? this.payload : [this.payload]
        const created: any[] = []
        for (const row of rows) created.push(await parse(await fetch(`${API_BASE}/api/${this.table}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(row) })))
        return { data: this.wantSingle ? created[0] : created, error: null }
      }
      if (this.op === 'update') {
        const id = this.idFilter()
        if (!id) throw new Error('update requires .eq("id", ...)')
        const updated = await parse(await fetch(`${API_BASE}/api/${this.table}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(this.payload) }))
        return { data: this.wantSingle ? updated : [updated], error: null }
      }
      // delete
      const id = this.idFilter()
      if (!id) throw new Error('delete requires .eq("id", ...)')
      await parse(await fetch(`${API_BASE}/api/${this.table}/${id}`, { method: 'DELETE', headers: authHeaders() }))
      return { data: null, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }

  then(resolve: (v: { data: any; error: any }) => any, reject?: (e: any) => any) {
    return this.run().then(resolve, reject)
  }
}

// ---- storage ----
const uploadCache = new Map<string, string>()

function storageFrom(bucket: string) {
  return {
    async upload(path: string, file: File, _opts?: any) {
      try {
        const form = new FormData()
        form.append('file', file)
        const data = await parse(await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: authHeaders(false), body: form }))
        uploadCache.set(`${bucket}/${path}`, data.url)
        return { data: { path }, error: null }
      } catch (error: any) { return { data: null, error: { message: error.message } } }
    },
    getPublicUrl(path: string) {
      return { data: { publicUrl: uploadCache.get(`${bucket}/${path}`) ?? path } }
    },
    async remove(_paths: string[]) { return { data: {}, error: null } }, // no-op: server keeps files
  }
}

// ---- auth ----
type Listener = (event: string, session: any | null) => void
const listeners = new Set<Listener>()
const notify = (session: any | null) => listeners.forEach((cb) => cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session))

const auth = {
  async getSession() {
    if (!getToken()) return { data: { session: null }, error: null }
    try {
      const me = await parse(await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() }))
      return { data: { session: { user: { email: me.username } } }, error: null }
    } catch { clearToken(); return { data: { session: null }, error: null } }
  },
  onAuthStateChange(cb: Listener) {
    listeners.add(cb)
    return { data: { subscription: { unsubscribe() { listeners.delete(cb) } } } }
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const data = await parse(await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ username: email, password }) }))
      setToken(data.token)
      const session = { user: { email: data.username } }
      notify(session)
      return { data: { session, user: session.user }, error: null }
    } catch (error: any) { return { data: { session: null, user: null }, error: { message: error.message } } }
  },
  async signOut() { clearToken(); notify(null); return { error: null } },
  async getUser() {
    try { const me = await parse(await fetch(`${API_BASE}/api/auth/me`, { headers: authHeaders() })); return { data: { user: { email: me.username } }, error: null } }
    catch (error: any) { return { data: { user: null }, error: { message: error.message } } }
  },
  async updateUser(attrs: { email?: string; password?: string }): Promise<{ data: any; error: { message: string } | null }> {
    try {
      const data = await parse(await fetch(`${API_BASE}/api/auth/update`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(attrs) }))
      return { data: { user: data.user }, error: null }
    } catch (error: any) { return { data: { user: null }, error: { message: error.message } } }
  },
  async resetPasswordForEmail(_email: string, _opts?: any): Promise<{ data: any; error: { message: string } | null }> { return { data: {}, error: null } },
}

export const supabase = {
  from: (table: string) => new Query(table),
  storage: { from: storageFrom },
  auth,
}
