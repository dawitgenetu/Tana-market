import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, productsAPI, reportsAPI, usersAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import DashboardLayout from '../components/DashboardLayout';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    salesChange: 0,
    ordersChange: 0,
    customersChange: 0,
    productsChange: 0,
  });

  const [chartData, setChartData] = useState<Array<{ date: string; sales: number; income: number }>>([]);
  const [incomePercentage, setIncomePercentage] = useState(75);
  const [customerStats, setCustomerStats] = useState({
    totalSpent: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalOrders: 0,
  });

  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadDashboardData();
      } else {
        navigate('/login');
      }
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      // Load orders
      const ordersData = await ordersAPI.getAll();
      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.data || [];

      // For customers, only show their own orders
      const filteredOrders = isAdmin ? ordersList : ordersList.filter((order: any) =>
        order.user?._id === user?._id || order.user === user?._id
      );

      setOrders(filteredOrders);

      // Only load products and analytics for admin/manager
      if (isAdmin) {
        // Load products
        const productsData = await productsAPI.getAll();
        const productsList = Array.isArray(productsData) ? productsData : productsData.data || [];
        setProducts(productsList);

        // Calculate statistics for admin
        const totalSales = ordersList.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
        const totalOrders = ordersList.length;

        let totalCustomers = 0;
        try {
          const allUsers = await usersAPI.getAll();
          totalCustomers = allUsers.filter((u: any) => u.role === 'customer').length;
        } catch (err) {
          console.error('Error loading users:', err);
        }

        // Generate chart data (last 7 days)
        const today = new Date();
        const chartDataArray: Array<{ date: string; sales: number; income: number }> = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          // Calculate sales for this day (mock data based on orders)
          const dayOrders = ordersList.filter((order: any) => {
            const orderDate = new Date(order.createdAt || order.date);
            return orderDate.toDateString() === date.toDateString();
          });
          const daySales = dayOrders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);

          chartDataArray.push({
            date: dateStr,
            sales: daySales,
            income: daySales * 0.85, // 85% of sales as income
          });
        }
        setChartData(chartDataArray);

        // Calculate percentage changes (mock for now, can be improved with historical data)
        const salesChange = chartDataArray.length > 1
          ? ((chartDataArray[chartDataArray.length - 1].sales - chartDataArray[0].sales) / chartDataArray[0].sales * 100)
          : 0;

        setStats({
          totalSales: totalSales,
          totalOrders: totalOrders,
          totalCustomers: totalCustomers,
          totalProducts: productsList.length,
          salesChange: salesChange,
          ordersChange: totalOrders > 0 ? 20 : 0,
          customersChange: totalCustomers > 0 ? 15 : 0,
          productsChange: productsList.length > 0 ? 10 : 0,
        });

        // Calculate income percentage
        const totalIncome = chartDataArray.reduce((sum, item) => sum + item.income, 0);
        const totalSalesAmount = chartDataArray.reduce((sum, item) => sum + item.sales, 0);
        setIncomePercentage(totalSalesAmount > 0 ? Math.round((totalIncome / totalSalesAmount) * 100) : 75);
      } else {
        // For customers, only show their order stats
        const customerOrders = filteredOrders;
        const totalSpent = customerOrders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
        const completedOrders = customerOrders.filter((o: any) => o.status === 'delivered').length;
        const pendingOrders = customerOrders.filter((o: any) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped').length;

        setStats({
          totalSales: 0, // Hide sales data
          totalOrders: customerOrders.length,
          totalCustomers: 0, // Hide customer count
          totalProducts: 0, // Hide product count
          salesChange: 0,
          ordersChange: 0,
          customersChange: 0,
          productsChange: 0,
        });

        // Store customer-specific stats
        setCustomerStats({
          totalSpent,
          completedOrders,
          pendingOrders,
          totalOrders: customerOrders.length,
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Sales',
      value: `${stats.totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB`,
      change: stats.salesChange,
      icon: DollarSign,
      color: 'bg-blue-500',
      progress: 71,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: 'bg-red-500',
      progress: 71,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers > 1000
        ? `${(stats.totalCustomers / 1000).toFixed(2)}M`
        : stats.totalCustomers.toLocaleString(),
      change: stats.customersChange,
      icon: Users,
      color: 'bg-yellow-500',
      progress: 71,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: stats.productsChange,
      icon: Package,
      color: 'bg-blue-400',
      progress: 71,
    },
  ];

  const bottomCards = [
    {
      title: 'Total Revenue',
      value: '5,456',
      change: 12,
      color: 'text-green-600',
      progress: 77,
      progressColor: 'bg-green-500',
    },
    {
      title: 'Total Expenses',
      value: '4,764',
      change: -18,
      color: 'text-red-600',
      progress: 53,
      progressColor: 'bg-red-500',
    },
    {
      title: 'Total Profit',
      value: '1.5M',
      change: 15,
      color: 'text-green-600',
      progress: 23,
      progressColor: 'bg-yellow-500',
    },
    {
      title: 'Total Orders',
      value: '21,564',
      change: 10,
      color: 'text-blue-600',
      progress: 80,
      progressColor: 'bg-blue-500',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 min-h-screen bg-slate-50/50">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 mt-1">
              {isAdmin
                ? "Overview of store performance and activity."
                : "Track your orders and account status."
              }
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-sm bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-slate-600 font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              System Operational
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((card, index) => {
            const Icon = card.icon;
            const isPositive = card.change >= 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                      <Icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                    </div>
                    {card.change !== 0 && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(card.change).toFixed(0)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">{card.title}</h3>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{card.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row - Only for Admin/Manager */}
        {isAdmin && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sales Income Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Revenue Analytics</h3>
                      <p className="text-sm text-slate-500">Income vs Sales over time</p>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                          }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                          dataKey="sales"
                          name="Total Sales"
                          fill="url(#colorSales)"
                          radius={[6, 6, 0, 0]}
                          barSize={30}
                        />
                        <Line
                          type="monotone"
                          dataKey="income"
                          name="Net Income"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: '#fff', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Customer Satisfaction Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Satisfaction</h3>
                  <p className="text-sm text-slate-500 mb-8">Customer feedback score</p>

                  <div className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Satisfied', value: incomePercentage },
                            { name: 'Neutral', value: 100 - incomePercentage },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                          paddingAngle={5}
                          cornerRadius={5}
                        >
                          <Cell fill="#3b82f6" strokeWidth={0} />
                          <Cell fill="#f1f5f9" strokeWidth={0} />
                        </Pie>
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan x="50%" dy="-0.5em" className="text-4xl font-bold fill-slate-900">{incomePercentage}%</tspan>
                          <tspan x="50%" dy="1.5em" className="text-sm fill-slate-500 font-medium">Positive</tspan>
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-2xl">
                      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Response Rate</p>
                      <p className="text-lg font-bold text-slate-900">94%</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-2xl">
                      <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Referral</p>
                      <p className="text-lg font-bold text-slate-900">12%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bottomCards.map((card, index) => {
                const isPositive = card.change >= 0;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-sm font-medium text-slate-500">{card.title}</h3>
                          <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {isPositive ? '+' : ''}{card.change}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${card.progressColor.replace('bg-', 'bg-')}`} style={{ width: `${card.progress}%` }}></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer View - Recent Orders */}
        {!isAdmin && (
          <div className="mt-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Orders</h3>
                  <p className="text-slate-500 text-sm mt-1">Track your delivery status</p>
                </div>
                {orders.length > 5 && (
                  <Link to="/orders">
                    <Button variant="outline" className="text-slate-600">View All</Button>
                  </Link>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">No orders yet</h3>
                  <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
                  <Link to="/products">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((order: any) => (
                    <div key={order._id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          #{order._id?.slice(-4)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Order #{order._id?.slice(-6).toUpperCase()}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(order.createdAt || order.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 md:gap-12">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total</p>
                          <p className="font-bold text-slate-900">{(order.totalPrice || 0).toLocaleString('en-US')} ETB</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-800'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
