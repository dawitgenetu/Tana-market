import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Clock, CheckCircle, XCircle, Truck, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ordersAPI } from '../../services/api';
import DashboardLayout from '../components/DashboardLayout';

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

        {orders.length === 0 ? (
          <Card className="p-12 bg-white border-gray-200 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link to="/products">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Browse Products
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id || order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 bg-white border-gray-200 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          Order #{order._id?.slice(-6) || order.id?.slice(-6) || 'N/A'}
                        </h3>
                        {order.status === 'cancelled' ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                            <p className="text-red-700 font-medium">Order Rejected</p>
                            <p className="text-red-600 text-sm mt-1">This order was rejected. Please try ordering again.</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-slate-600">
                                Tracking:
                              </p>
                              {order.trackingNumber ? (
                                <Link 
                                  to={`/tracking?trackingNumber=${order.trackingNumber}`}
                                  className="text-blue-600 font-medium hover:text-blue-700 hover:underline flex items-center gap-1"
                                >
                                  <Search className="w-4 h-4" />
                                  {order.trackingNumber}
                                </Link>
                              ) : (
                                <span className="text-gray-500 italic">Not yet assigned</span>
                              )}
                            </div>
                            {order.status === 'shipped' && order.estimatedArrivalDate && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                <p className="text-blue-700 font-medium">Estimated Arrival</p>
                                <p className="text-blue-600 text-sm mt-1">
                                  {new Date(order.estimatedArrivalDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                        <p className="text-slate-500 text-sm">
                          Placed on {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
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
                        {(order.totalPrice || order.total || 0).toLocaleString('en-US')} ETB
                      </div>
                      {(order.orderItems?.length || order.items) && (
                        <p className="text-slate-500 text-sm">
                          {order.orderItems?.length || order.items} {(order.orderItems?.length || order.items) === 1 ? 'item' : 'items'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Products:</h4>
                      <div className="space-y-3">
                        {order.orderItems.map((item: any, idx: number) => {
                          // Handle both populated and non-populated product data
                          const productName = item.name || item.product?.name || 'Product';
                          const productImage = item.image || item.product?.image || '';
                          const productPrice = item.price || item.product?.price || 0;
                          const quantity = item.quantity || 1;
                          
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              {productImage && (
                                <img 
                                  src={productImage} 
                                  alt={productName} 
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">
                                  {productName}
                                </p>
                                <p className="text-sm text-slate-600">
                                  Quantity: {quantity} × {productPrice.toLocaleString('en-US')} ETB
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900">
                                  {(productPrice * quantity).toLocaleString('en-US')} ETB
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
