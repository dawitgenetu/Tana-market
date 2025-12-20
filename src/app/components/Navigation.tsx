import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, User, Menu, X, Package, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function Navigation() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-cyan-500/20 shadow-lg shadow-cyan-500/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              TANA Market
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Products
            </Link>
            <Link to="/tracking" className="text-gray-300 hover:text-cyan-400 transition-colors">
              Track Order
            </Link>
            {user && (
              <>
                <Link to="/orders" className="text-gray-300 hover:text-cyan-400 transition-colors">
                  My Orders
                </Link>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <>
                    <Link to="/dashboard" className="text-gray-300 hover:text-cyan-400 transition-colors">
                      <LayoutDashboard className="w-5 h-5" />
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="text-gray-300 hover:text-cyan-400 transition-colors">
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <ShoppingCart className="w-6 h-6 text-gray-300 hover:text-cyan-400 transition-colors" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-cyan-500 text-white">
                    {cartItemCount}
                  </Badge>
                )}
              </motion.div>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400 hidden md:block">{user.name}</span>
                <Button onClick={logout} variant="ghost" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-cyan-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-cyan-500/20"
        >
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 text-gray-300 hover:text-cyan-400">
              Home
            </Link>
            <Link to="/products" className="block py-2 text-gray-300 hover:text-cyan-400">
              Products
            </Link>
            <Link to="/tracking" className="block py-2 text-gray-300 hover:text-cyan-400">
              Track Order
            </Link>
            {user && (
              <>
                <Link to="/orders" className="block py-2 text-gray-300 hover:text-cyan-400">
                  My Orders
                </Link>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <>
                    <Link to="/dashboard" className="block py-2 text-gray-300 hover:text-cyan-400">
                      Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block py-2 text-gray-300 hover:text-cyan-400">
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
