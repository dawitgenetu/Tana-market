import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, reportsAPI, productsAPI, usersAPI } from '../../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load sales stats
      const salesData = await reportsAPI.getSales();
      
      // Load products count
      const productsRaw = await productsAPI.getAll();
      const products = Array.isArray(productsRaw) ? productsRaw : (productsRaw && productsRaw.data) ? productsRaw.data : [];
      
      // Load users count
      const users = await usersAPI.getAll();
      
      // Load orders
      const orders = await ordersAPI.getAll();

      setStats({
        totalSales: salesData.totalSales || 0,
        totalOrders: salesData.totalOrders || 0,
        totalCustomers: users.filter((u: any) => u.role === 'customer').length,
        totalProducts: products.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-cyan-700 rounded-lg text-white text-center">
          <div className="text-sm">Total Sales</div>
          <div className="text-2xl font-bold mt-2">{stats.totalSales.toLocaleString('en-US')} ETB</div>
        </div>
        <div className="p-6 bg-green-700 rounded-lg text-white text-center">
          <div className="text-sm">Total Orders</div>
          <div className="text-2xl font-bold mt-2">{stats.totalOrders}</div>
        </div>
        <div className="p-6 bg-yellow-600 rounded-lg text-white text-center">
          <div className="text-sm">Total Customers</div>
          <div className="text-2xl font-bold mt-2">{stats.totalCustomers}</div>
        </div>
        <div className="p-6 bg-red-600 rounded-lg text-white text-center">
          <div className="text-sm">Total Products</div>
          <div className="text-2xl font-bold mt-2">{stats.totalProducts}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-300">This is your admin dashboard. Use the sidebar to navigate to different sections.</p>
      </div>
    </div>
  );
}

