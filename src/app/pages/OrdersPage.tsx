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
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-gray-400">Track and manage your orders</p>
        </motion.div>

        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                      <Package className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Order #{order.id}
                      </h3>
                      <p className="text-gray-400 mb-2">
                        Tracking: <span className="text-cyan-400">{order.trackingNumber}</span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </Badge>
                    <div className="text-2xl font-bold text-cyan-400">
                      ${order.total.toFixed(2)}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {order.items} {order.items === 1 ? 'item' : 'items'}
                    </p>
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
