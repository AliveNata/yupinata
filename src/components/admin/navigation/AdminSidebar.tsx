import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, Settings, Music } from 'lucide-react';

const links = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/content', label: 'Content', icon: FileText },
  { path: '/admin/images', label: 'Images', icon: Image },
  { path: '/admin/music', label: 'Music', icon: Music }
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-pink-accent/20 backdrop-blur-sm shadow-sm min-h-[calc(100vh-4rem)]">
      <nav className="mt-5 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`
                mt-1 group flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all
                ${isActive
                  ? 'bg-pink-accent text-white'
                  : 'text-black hover:bg-pink-accent hover:text-white'}
              `}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}