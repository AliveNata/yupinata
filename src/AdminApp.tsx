import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/admin/ProtectedRoute'
import { Login } from './pages/admin/Login'
import { Dashboard } from './pages/admin/Dashboard'
import { Content } from './pages/admin/Content'
import { Images } from './pages/admin/Images'
import { Music } from './pages/admin/Music'
import { Settings } from './pages/admin/Settings'

export default function AdminApp() {
  // Remove the HTML splash screen (the Preloader, which admin skips, normally does this).
  useEffect(() => {
    const splash = document.getElementById('splash')
    if (splash) { splash.style.opacity = '0'; setTimeout(() => splash.remove(), 600) }
  }, [])

  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
        <Route path="/admin/images" element={<ProtectedRoute><Images /></ProtectedRoute>} />
        <Route path="/admin/music" element={<ProtectedRoute><Music /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </AuthProvider>
  )
}
