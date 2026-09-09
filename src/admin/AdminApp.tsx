import { useEffect } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import ResourceManager from './ResourceManager'
import type { ResourceConfig } from './ResourceManager'

const SECTIONS: ResourceConfig = {
  endpoint: '/api/sections', title: 'Sections', columns: ['name', 'title', 'display_order'],
  fields: [
    { key: 'name', label: 'Name (key)', kind: 'text', required: true },
    { key: 'title', label: 'Title', kind: 'text' },
    { key: 'content', label: 'Content', kind: 'textarea' },
    { key: 'display_order', label: 'Display order', kind: 'number' },
    { key: 'profiles', label: 'Profiles (JSON)', kind: 'json' },
  ],
}
const IMAGES: ResourceConfig = {
  endpoint: '/api/images', title: 'Images', columns: ['path', 'section', 'description', 'display_order'],
  fields: [
    { key: 'section', label: 'Section', kind: 'text', required: true },
    { key: 'path', label: 'Image', kind: 'image', required: true },
    { key: 'description', label: 'Description', kind: 'text' },
    { key: 'display_order', label: 'Display order', kind: 'number' },
  ],
}
const SONGS: ResourceConfig = {
  endpoint: '/api/songs', title: 'Songs', columns: ['title', 'artist', 'album', 'display_order'],
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

function Shell() {
  const { user, loading, logout } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center text-neutral-400">Loading...</div>
  if (!user) return <Login />

  const link = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-pink-50 text-pink-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-900">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white p-4 flex flex-col">
        <div className="font-semibold mb-6">Yupinata Admin</div>
        <nav className="space-y-1">
          <NavLink to="/admin/sections" className={link}>Sections</NavLink>
          <NavLink to="/admin/images" className={link}>Images</NavLink>
          <NavLink to="/admin/songs" className={link}>Songs</NavLink>
        </nav>
        <div className="mt-auto pt-4 border-t border-neutral-100">
          <div className="text-xs text-neutral-400 mb-2">Signed in as {user}</div>
          <button onClick={logout} className="text-sm text-neutral-600 hover:text-pink-600">Log out</button>
        </div>
      </aside>
      <main className="flex-1 p-8 max-w-4xl">
        <Routes>
          <Route path="/admin/sections" element={<ResourceManager config={SECTIONS} />} />
          <Route path="/admin/images" element={<ResourceManager config={IMAGES} />} />
          <Route path="/admin/songs" element={<ResourceManager config={SONGS} />} />
          <Route path="*" element={<Navigate to="/admin/sections" replace />} />
        </Routes>
      </main>
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
