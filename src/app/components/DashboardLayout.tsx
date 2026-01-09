import React, { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard,
  BarChart3,
  ShoppingBag,
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
  ChevronDown,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  HelpCircle,
  Home,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

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
    // Dashboard is only active on exact match
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isAdminUser = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isStaff = isAdminUser || isManager;
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    // Analytics/Reports are admin-only in the backend, so hide from managers
    ...(isAdminUser ? [{ icon: BarChart3, label: 'Analytics', path: '/dashboard/reports' }] : []),
    { icon: ShoppingBag, label: 'E-commerce', path: '/products' },
    { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages' },
    { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  let adminMenuItems: { icon: any; label: string; path: string }[] = [];

  if (isAdminUser) {
    adminMenuItems = [
      { icon: Users, label: 'Users', path: '/dashboard/users' },
      { icon: Package, label: 'Products', path: '/dashboard/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
      { icon: UserCircle, label: 'Customers', path: '/dashboard/users' },
      { icon: FileText, label: 'Reports', path: '/dashboard/reports' },
      { icon: MessageSquare, label: 'Messages', path: '/dashboard/comments' },
      { icon: Activity, label: 'Activity Logs', path: '/dashboard/activity' },
      { icon: HelpCircle, label: 'Help', path: '/dashboard/help' },
    ];
  } else if (isManager) {
    // Managers should only see tools they are authorized for in the backend
    adminMenuItems = [
      { icon: Package, label: 'Products', path: '/dashboard/products' },
      { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
      { icon: MessageSquare, label: 'Messages', path: '/dashboard/comments' },
      { icon: HelpCircle, label: 'Help', path: '/dashboard/help' },
    ];
  }

  // Dashboard is active only when exactly on /dashboard
  const isDashboardActive = location.pathname === '/dashboard';

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/20 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
           
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {/* Menu Items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all relative ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {active && <div className="w-1 h-5 bg-white rounded-r-full absolute left-0"></div>}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}

            {/* Rating Page Link - Only for staff (admin/manager) */}
            {isStaff && (
              <Link
                to="/dashboard/ratings"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all relative ${
                  location.pathname === '/dashboard/ratings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {location.pathname === '/dashboard/ratings' && <div className="w-1 h-5 bg-white rounded-r-full absolute left-0"></div>}
                <Star className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Rate Products</span>
              </Link>
            )}

            {/* Refund Page Link */}
            <Link
              to="/dashboard/refunds"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all relative ${
                location.pathname === '/dashboard/refunds'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {location.pathname === '/dashboard/refunds' && <div className="w-1 h-5 bg-white rounded-r-full absolute left-0"></div>}
              <Package className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">Refunds & Returns</span>
            </Link>

            {adminMenuItems.length > 0 && (
              <div className="pt-1 mt-1 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase px-4 mb-1">Admin Tools</p>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all relative ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {active && <div className="w-1 h-5 bg-white rounded-r-full absolute left-0"></div>}
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all w-full mt-auto"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
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
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  TANA Market
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <ProfileDropdown />
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
