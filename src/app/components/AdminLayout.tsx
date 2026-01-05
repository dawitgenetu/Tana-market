import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  MessageSquare, 
  Activity, 
  FileText,
  LogOut,
  Home
} from 'lucide-react';
import { Button } from './ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
  ];

  const adminMenuItems = user?.role === 'admin' ? [
    { icon: Users, label: 'Manage Managers & Customers', path: '/dashboard/users' },
    { icon: Package, label: 'CRUD Products', path: '/dashboard/products' },
    { icon: CheckCircle2, label: 'Approve / Reject Orders', path: '/dashboard/orders' },
    { icon: BarChart3, label: 'Reports & Analytics', path: '/dashboard/reports' },
    { icon: MessageSquare, label: 'Manage Comments', path: '/dashboard/comments' },
    { icon: Activity, label: 'Activity Logs', path: '/dashboard/activity' },
    { icon: FileText, label: 'Generate Daily Report', path: '/dashboard/reports/generate-daily' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  TANA Market
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              {user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 hidden md:block">{user.name}</span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
            
            {adminMenuItems.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">Admin Tools</p>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}>
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
