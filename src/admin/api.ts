const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') // '' = same-origin
const TOKEN_KEY = 'yupinata-admin-token'

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }
export const setToken = (t: string) => { try { localStorage.setItem(TOKEN_KEY, t) } catch { /* ignore */ } }
export const clearToken = () => { try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } }

async function request(method: string, path: string, body?: any): Promise<any> {
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  if (res.status === 401) { clearToken(); throw new Error('Session expired - please log in again') }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const apiGet = (path: string) => request('GET', path)
export const apiPost = (path: string, body?: any) => request('POST', path, body ?? {})
export const apiPut = (path: string, body?: any) => request('PUT', path, body ?? {})
export const apiDelete = (path: string) => request('DELETE', path)

export async function login(username: string, password: string) {
  const data = await request('POST', '/api/auth/login', { username, password })
  setToken(data.token)
  return data
}
export const checkAuth = () => request('GET', '/api/auth/me')

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.url as string
}
