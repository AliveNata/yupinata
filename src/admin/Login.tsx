import { useState } from 'react'
import { useAuth } from './AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try { await login(username, password) }
    catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Yupinata Admin</h1>
        <p className="text-sm text-neutral-400 mb-6">Sign in to manage content.</p>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="username" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-3" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-4" />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button disabled={busy} className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-lg py-2 text-sm disabled:opacity-50">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </div>
  )
}
