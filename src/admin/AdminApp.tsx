import { useEffect } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { FileText, Image as ImageIcon, Music, ArrowLeft, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import ResourceManager from './ResourceManager'
import type { ResourceConfig } from './ResourceManager'

const SECTIONS: ResourceConfig = {
  endpoint: '/api/sections', title: 'Sections', newLabel: 'section',
  columns: ['name', 'title', 'display_order'],
  fields: [
    { key: 'name', label: 'Name (key)', kind: 'text', required: true },
    { key: 'title', label: 'Title', kind: 'text' },
    { key: 'content', label: 'Content', kind: 'textarea' },
    { key: 'display_order', label: 'Display order', kind: 'number' },
    { key: 'profiles', label: 'Profiles (JSON)', kind: 'json' },
  ],
}
const IMAGES: ResourceConfig = {
  endpoint: '/api/images', title: 'Images', newLabel: 'image',
  columns: ['path', 'section', 'description', 'display_order'],
  fields: [
    { key: 'section', label: 'Section', kind: 'text', required: true },
    { key: 'path', label: 'Image', kind: 'image', required: true },
    { key: 'description', label: 'Description', kind: 'text' },
    { key: 'display_order', label: 'Display order', kind: 'number' },
  ],
}
const SONGS: ResourceConfig = {
  endpoint: '/api/songs', title: 'Songs', newLabel: 'song',
  columns: ['title', 'artist', 'album', 'display_order'],
  fields: [
    { key: 'title', label: 'Title', kind: 'text', required: true },
    { key: 'artist', label: 'Artist', kind: 'text' },
    { key: 'album', label: 'Album', kind: 'text' },
    { key: 'cover_url', label: 'Cover', kind: 'image' },
    { key: 'audio_url', label: 'Audio', kind: 'audio' },
    { key: 'lyrics', label: 'Lyrics', kind: 'textarea' },
    { key: 'display_order', label: 'Display order', kind: 'number' },
  ],
}

const NAV: { to: string; label: string; icon: LucideIcon; config: ResourceConfig }[] = [
  { to: '/admin/sections', label: 'Sections', icon: FileText, config: SECTIONS },
  { to: '/admin/images', label: 'Images', icon: ImageIcon, config: IMAGES },
  { to: '/admin/songs', label: 'Songs', icon: Music, config: SONGS },
]

function Shell() {
  const { user, loading, logout } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center bg-pink-soft text-gray-500">Loading...</div>
  if (!user) return <Login />

  return (
    <div className="min-h-screen bg-white text-black">
      <nav className="bg-black/80 backdrop-blur-sm border-b border-white/10">
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

      <div className="flex bg-gray-50">
        <aside className="w-64 shrink-0 bg-pink-accent/20 backdrop-blur-sm shadow-sm min-h-[calc(100vh-4rem)]">
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
              <Route path="/admin/sections" element={<ResourceManager config={SECTIONS} />} />
              <Route path="/admin/images" element={<ResourceManager config={IMAGES} />} />
              <Route path="/admin/songs" element={<ResourceManager config={SONGS} />} />
              <Route path="*" element={<Navigate to="/admin/sections" replace />} />
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
