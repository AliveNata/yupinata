import { Link } from 'react-router-dom'
import { FileText, Image as ImageIcon, Music } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CARDS: { title: string; description: string; icon: LucideIcon; path: string; gradient: string }[] = [
  { title: 'Content Management', description: 'Manage website sections and text', icon: FileText, path: '/admin/content', gradient: 'from-sky to-sky-dark' },
  { title: 'Image Management', description: 'Manage images and galleries', icon: ImageIcon, path: '/admin/images', gradient: 'from-pink-accent to-pink-deep' },
  { title: 'Music Management', description: 'Manage the playlist and audio files', icon: Music, path: '/admin/music', gradient: 'from-sky-light to-pink-soft' },
]

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARDS.map((c) => {
          const Icon = c.icon
          return (
            <Link key={c.path} to={c.path} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="relative p-6 bg-white/90">
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={24} className="text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-800">{c.title}</h2>
                </div>
                <p className="text-gray-600">{c.description}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
