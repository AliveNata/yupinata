import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import { AdminSidebar } from './navigation/AdminSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-white">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-white/80 hover:text-sky transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Back to Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/80 hover:text-sky transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="flex bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <div className="glass-morphism rounded-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}