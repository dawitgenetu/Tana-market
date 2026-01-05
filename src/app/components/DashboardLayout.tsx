import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
  FolderKanban,
  MessageSquare,
  Calendar,
  CheckSquare,
  Settings,
  Users,
  Package,
  ShoppingCart,
  UserCircle,
  FileText,
  Activity,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  HelpCircle,
  Home
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/reports' },
    { icon: ShoppingBag, label: 'E-commerce', path: '/products' },
    { icon: FolderKanban, label: 'Projects', path: '/dashboard' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard' },
    { icon: CheckSquare, label: 'Tasks', path: '/dashboard' },
    { icon: Settings, label: 'Settings', path: '/dashboard' },
  ];

  const adminMenuItems = (user?.role === 'admin' || user?.role === 'manager') ? [
    { icon: Users, label: 'Users', path: '/dashboard/users' },
    { icon: Package, label: 'Products', path: '/dashboard/products' },
    { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
    { icon: UserCircle, label: 'Customers', path: '/dashboard/users' },
    { icon: FileText, label: 'Reports', path: '/dashboard/reports' },
    { icon: FileText, label: 'Invoices', path: '/dashboard' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/comments' },
    { icon: Activity, label: 'Support', path: '/dashboard/activity' },
    { icon: HelpCircle, label: 'Help', path: '/dashboard' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {active && <div className="w-1 h-6 bg-white rounded-r-full absolute left-0"></div>}
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {adminMenuItems.length > 0 && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {active && <div className="w-1 h-6 bg-white rounded-r-full absolute left-0"></div>}
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all w-full mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Dashbord
                </span>
              </Link>
              <div className="relative flex-1 max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600 hidden md:flex">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
