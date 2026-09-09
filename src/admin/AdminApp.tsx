import { useEffect } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { LayoutDashboard, FileText, Image as ImageIcon, Music as MusicIcon, ArrowLeft, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import Dashboard from './Dashboard'
import Content from './Content'
import Images from './Images'
import Music from './Music'

const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/content', label: 'Content', icon: FileText },
  { to: '/admin/images', label: 'Images', icon: ImageIcon },
  { to: '/admin/music', label: 'Music', icon: MusicIcon },
]

function Shell() {
  const { user, loading, logout } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center bg-pink-soft text-gray-500">Loading...</div>
  if (!user) return <Login />

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="bg-black/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-semibold text-white">Admin Panel</span>
            <div className="flex items-center gap-6">
              <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/80 hover:text-sky transition-colors">
                <ArrowLeft size={18} /> <span className="hidden sm:inline">Back to Website</span>
              </a>
              <button onClick={logout} className="flex items-center gap-2 text-white/80 hover:text-sky transition-colors">
                <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex bg-gray-50 min-h-[calc(100vh-4rem)]">
        <aside className="w-64 shrink-0 bg-pink-accent/20 backdrop-blur-sm shadow-sm">
          <nav className="mt-5 px-2 space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `group flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all ${isActive ? 'bg-pink-accent text-white' : 'text-black hover:bg-pink-accent hover:text-white'}`}>
                <Icon size={20} /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 p-6">
          <div className="glass-morphism rounded-xl p-6">
            <Routes>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/content" element={<Content />} />
              <Route path="/admin/images" element={<Images />} />
              <Route path="/admin/music" element={<Music />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminApp() {
  // Remove the HTML splash screen (the Preloader, which admin skips, normally does this).
  useEffect(() => {
    const splash = document.getElementById('splash')
    if (splash) { splash.style.opacity = '0'; setTimeout(() => splash.remove(), 600) }
  }, [])
  return <AuthProvider><Shell /></AuthProvider>
}
