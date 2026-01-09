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
import RatingPage from './pages/RatingPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import CalendarPage from './pages/dashboard/CalendarPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import HelpPage from './pages/dashboard/HelpPage';
import RefundPage from './pages/RefundPage';
import ContactPage from './pages/ContactPage';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

function AppContent() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || location.pathname === '/orders';

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
        <Route path="/dashboard/ratings" element={<RatingPage />} />
        <Route path="/dashboard/messages" element={<MessagesPage />} />
        <Route path="/dashboard/calendar" element={<CalendarPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/help" element={<HelpPage />} />
        <Route path="/dashboard/refunds" element={<RefundPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/comments" element={<CommentsPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      {!isDashboardRoute && <Footer />}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-slate-50">
            <AppContent />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
