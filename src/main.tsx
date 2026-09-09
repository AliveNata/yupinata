import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MusicProvider } from './lib/MusicContext'
import './index.css'
import App from './App.tsx'

// Admin has no loader: drop the splash before React renders (CSP-safe, runs in-bundle).
if (location.pathname.startsWith('/admin')) {
  const splash = document.getElementById('splash')
  if (splash) splash.remove()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MusicProvider>
        <App />
      </MusicProvider>
    </BrowserRouter>
  </StrictMode>,
)
