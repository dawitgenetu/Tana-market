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
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-blue-200 shadow-md shadow-blue-100/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center"
            >
              <Package className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              TANA Market
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/products" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
              Products
            </Link>
            {/* Tracking feature removed from MVP */}
            {user && (
              <>
                <Link to="/orders" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                  My Orders
                </Link>
                <Link to="/dashboard" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <ShoppingCart className="w-6 h-6 text-slate-700 hover:text-blue-600 transition-colors" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white">
                    {cartItemCount}
                  </Badge>
                )}
              </motion.div>
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 hidden md:block">{user.name}</span>
                <Button onClick={logout} variant="ghost" size="sm" className="text-slate-700 hover:text-blue-600">
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-700 hover:text-blue-600"
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
          className="md:hidden bg-white/95 backdrop-blur-xl border-t border-blue-200 shadow-lg"
        >
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 text-slate-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/products" className="block py-2 text-slate-700 hover:text-blue-600 font-medium">
              Products
            </Link>
            {/* Tracking feature removed from MVP */}
            {user && (
              <>
                <Link to="/orders" className="block py-2 text-slate-700 hover:text-blue-600 font-medium">
                  My Orders
                </Link>
                <Link to="/dashboard" className="block py-2 text-slate-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
