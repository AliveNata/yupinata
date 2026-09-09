import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  gradient: string;
}

export function AdminCard({ title, description, icon: Icon, path, gradient }: AdminCardProps) {
  return (
    <Link
      to={path}
      className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="relative p-6 bg-white/90">
        <div className="flex items-center gap-3 mb-3">
          <Icon size={24} className="text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
}