import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { checkAuth, clearToken, getToken, login as apiLogin } from './api'

type AuthState = { user: string | null; loading: boolean; login: (u: string, p: string) => Promise<void>; logout: () => void }

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { setLoading(false); return }
    checkAuth()
      .then((d) => setUser(d.username))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const login = async (u: string, p: string) => {
    const d = await apiLogin(u, p)
    setUser(d.username)
  }
  const logout = () => { clearToken(); setUser(null) }

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
