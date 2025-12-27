import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Truck,
  ArrowRight,
  ShoppingCart,
  Star,
  Activity
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      const ordersList = Array.isArray(data) ? data : data.data || [];
      setOrders(ordersList);
      
      // Calculate statistics
      const totalOrders = ordersList.length;
      const totalSpent = ordersList.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
      const pendingOrders = ordersList.filter((order: any) => 
        order.status === 'pending' || order.status === 'processing' || order.status === 'shipped'
      ).length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        averageOrderValue,
      });
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <Clock className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome back, {user.name}!
          </h1>
          <p className="text-slate-600 text-lg">Here's an overview of your account activity</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalOrders}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-white border-cyan-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium mb-1">Total Spent</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stats.totalSpent.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
                      </p>
                    </div>
                    <div className="p-3 bg-cyan-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-white border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium mb-1">Pending Orders</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.pendingOrders}</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-white border-green-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium mb-1">Avg. Order Value</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stats.averageOrderValue.toLocaleString('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/products">
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 shadow-sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                  <Link to="/orders">
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 shadow-sm">
                      <Package className="w-4 h-4 mr-2" />
                      View All Orders
                    </Button>
                  </Link>
                  <Link to="/cart">
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 shadow-sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Cart
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
                {orders.length > 5 && (
                  <Link to="/orders">
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>

              {recentOrders.length === 0 ? (
                <Card className="p-12 bg-white border-blue-100 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders yet</h3>
                  <p className="text-slate-600 mb-6">Start shopping to see your orders here</p>
                  <Link to="/products">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any, i) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                    >
                      <Card className="p-6 bg-white border-blue-100 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 mb-1">
                                Order #{order._id?.slice(-6) || order.id?.slice(-6) || 'N/A'}
                              </h3>
                              <p className="text-slate-600 text-sm mb-2">
                                {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              {order.orderItems && order.orderItems.length > 0 && (
                                <p className="text-slate-500 text-sm">
                                  {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              <span className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                              </span>
                            </Badge>
                            <p className="text-2xl font-bold text-slate-900">
                              {(order.totalPrice || order.total || 0).toLocaleString('en-US', { 
                                style: 'currency', 
                                currency: 'ETB' 
                              })}
                            </p>
                            <Link to={`/orders`}>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
