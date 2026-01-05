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
import { Card } from '../components/ui/card';
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

  const [chartData, setChartData] = useState<any[]>([]);
  const [incomePercentage, setIncomePercentage] = useState(75);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const isAdmin = user?.role === 'admin' || user?.role === 'manager';
      
      // Load orders
      const ordersData = await ordersAPI.getAll();
      const ordersList = Array.isArray(ordersData) ? ordersData : ordersData.data || [];
      setOrders(ordersList);
      
      // Load products
      const productsData = await productsAPI.getAll();
      const productsList = Array.isArray(productsData) ? productsData : productsData.data || [];
      setProducts(productsList);
      
      // Calculate statistics
      const totalSales = ordersList.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
      const totalOrders = ordersList.length;
      
      let totalCustomers = 0;
      if (isAdmin) {
        try {
          const allUsers = await usersAPI.getAll();
          totalCustomers = allUsers.filter((u: any) => u.role === 'customer').length;
        } catch (err) {
          console.error('Error loading users:', err);
        }
      } else {
        totalCustomers = 1; // For customer view
      }

      // Generate chart data (last 7 days)
      const today = new Date();
      const chartDataArray = [];
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

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Sales',
      value: stats.totalSales.toLocaleString('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }),
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
      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
                <Card className="p-6 bg-white border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.color} p-3 rounded-full`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(card.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm text-gray-600 mb-1">{card.title}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{card.value}</p>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${card.color} rounded-full`}
                      style={{ width: `${card.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{card.progress}%</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Sales Income Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 bg-white border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Income</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Customer Satisfaction Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-white border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Satisfaction</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Satisfied', value: incomePercentage },
                        { name: 'Other', value: 100 - incomePercentage },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-3xl font-bold text-gray-900"
                    >
                      {incomePercentage}%
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {bottomCards.map((card, index) => {
            const isPositive = card.change >= 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="p-6 bg-white border-gray-200 shadow-sm">
                  <h3 className="text-sm text-gray-600 mb-2">{card.title}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <div className="flex items-center gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${card.color}`}>
                        {isPositive ? '+' : ''}{card.change}%
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${card.progressColor} rounded-full`}
                      style={{ width: `${card.progress}%` }}
                    ></div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bars Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'New Customers', percentage: 27, color: 'bg-red-500' },
            { title: 'Active Users', percentage: 63, color: 'bg-green-500' },
            { title: 'Pending Orders', percentage: 33, color: 'bg-yellow-500' },
            { title: 'Completed Tasks', percentage: 80, color: 'bg-blue-500' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <Card className="p-6 bg-white border-gray-200 shadow-sm">
                <h3 className="text-sm text-gray-600 mb-4">{item.title}</h3>
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-2">{item.percentage}%</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
