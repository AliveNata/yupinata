import React from 'react';
import { FileText, Image, Settings, Music } from 'lucide-react';
import { Layout } from '../../components/admin/Layout';
import { AdminCard } from '../../components/admin/ui/Card';

const dashboardCards = [
  {
    title: 'Content Management',
    description: 'Manage website content and sections',
    icon: FileText,
    path: '/admin/content',
    gradient: 'from-blue-ice to-blue-ice-dark'
  },
  {
    title: 'Image Management',
    description: 'Manage website images and galleries',
    icon: Image,
    path: '/admin/images',
    gradient: 'from-pink to-pink-dark'
  },
  {
    title: 'Music Management',
    description: 'Manage music playlist and audio files',
    icon: Music,
    path: '/admin/music',
    gradient: 'from-sky to-sky-dark'
  }
];

export function Dashboard() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboardCards.map((card) => (
          <AdminCard key={card.path} {...card} />
        ))}
      </div>
    </Layout>
  );
}