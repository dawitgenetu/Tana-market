import React from 'react';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ordersAPI } from '../../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await ordersAPI.getAll();
        if (!mounted) return;
        const items = Array.isArray(data) ? data : data.data || [];
        setOrders(items);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-slate-600">Track and manage your orders</p>
        </motion.div>

        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-white border-blue-200 hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Order #{order._id?.slice(-6) || order.id?.slice(-6) || 'N/A'}
                      </h3>
                      {order.trackingNumber && (
                        <p className="text-slate-600 mb-2">
                          Tracking: <span className="text-blue-600 font-medium">{order.trackingNumber}</span>
                        </p>
                      )}
                      <p className="text-slate-500 text-sm">
                        Placed on {new Date(order.createdAt || order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                      </span>
                    </Badge>
                    <div className="text-2xl font-bold text-slate-900">
                      {(order.totalPrice || order.total || 0).toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'ETB' 
                      })}
                    </div>
                    {order.items && (
                      <p className="text-slate-500 text-sm">
                        {order.items} {order.items === 1 ? 'item' : 'items'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
