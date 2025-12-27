import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import TrackingPage from './pages/TrackingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminCommentsPage from './pages/admin/AdminCommentsPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminGenerateDailyPage from './pages/admin/AdminGenerateDailyPage';
import CommentsPage from './pages/CommentsPage';
import LoginPage from './pages/LoginPage';
import Navigation from './components/Navigation';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <Navigation />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/comments" element={<AdminCommentsPage />} />
              <Route path="/admin/activity" element={<AdminActivityPage />} />
              <Route path="/admin/reports/generate-daily" element={<AdminGenerateDailyPage />} />
              <Route path="/comments" element={<CommentsPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Routes>
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
