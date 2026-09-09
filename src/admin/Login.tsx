import { useState } from 'react'
import { AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try { await login(username, password) }
    catch (e: any) { setError(e.message); setBusy(false) }
  }

  const field = 'w-full px-4 py-2 rounded-xl border border-pink-soft focus:ring-2 focus:ring-sky-light focus:border-sky outline-none transition-all text-black'

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-soft px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-pink-soft">
          <h1 className="text-3xl font-semibold mb-8 text-center text-black">Welcome Back!</h1>

          {error && (
            <div className="mb-6 p-4 bg-pink-soft rounded-lg flex items-center gap-2 text-pink-accent">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" placeholder="Enter your username" className={field} />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" className={`${field} pr-11`} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${busy ? 'bg-sky-light cursor-not-allowed' : 'bg-sky hover:bg-sky-dark'}`}>
              <LogIn size={20} />
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
