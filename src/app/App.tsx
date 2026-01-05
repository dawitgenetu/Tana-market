import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import AdminProductsPage from './pages/admin/AdminProductsPage';
import ProductCreatePage from './pages/admin/ProductCreatePage';
import ProductEditPage from './pages/admin/ProductEditPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminCommentsPage from './pages/admin/AdminCommentsPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminGenerateDailyPage from './pages/admin/AdminGenerateDailyPage';
import CommentsPage from './pages/CommentsPage';
import LoginPage from './pages/LoginPage';
import Navigation from './components/Navigation';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <>
      {!isDashboardRoute && <Navigation />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/products" element={<AdminProductsPage />} />
        <Route path="/dashboard/products/new" element={<ProductCreatePage />} />
        <Route path="/dashboard/products/edit/:id" element={<ProductEditPage />} />
        <Route path="/dashboard/users" element={<AdminUsersPage />} />
        <Route path="/dashboard/orders" element={<AdminOrdersPage />} />
        <Route path="/dashboard/reports" element={<AdminReportsPage />} />
        <Route path="/dashboard/comments" element={<AdminCommentsPage />} />
        <Route path="/dashboard/activity" element={<AdminActivityPage />} />
        <Route path="/dashboard/reports/generate-daily" element={<AdminGenerateDailyPage />} />
        <Route path="/comments" element={<CommentsPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
            <AppContent />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
