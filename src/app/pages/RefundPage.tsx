import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function RefundPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadOrders();
    }
  }, [user, authLoading]);

  const loadOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      const ordersList = Array.isArray(data) ? data : data.data || [];
      // Only show delivered or shipped orders that can be refunded
      const refundableOrders = ordersList.filter((order: any) => 
        (order.status === 'delivered' || order.status === 'shipped') && 
        order.refundStatus !== 'approved' && 
        order.refundStatus !== 'refunded'
      );
      setOrders(refundableOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async (orderId: string) => {
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    try {
      await ordersAPI.requestRefund(orderId, refundReason);
      toast.success('Refund request submitted successfully');
      setSelectedOrder(null);
      setRefundReason('');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit refund request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="mb-6">
          <Link to="/orders" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Refund & Returns</h2>
          <p className="text-gray-600">Request a refund or return for your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 bg-white border-gray-200 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No refundable orders</h3>
            <p className="text-gray-600">You can request refunds for delivered or shipped orders</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="p-6 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        Order #{order._id?.slice(-6) || 'N/A'}
                      </h3>
                      {order.refundStatus && order.refundStatus !== 'none' && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.refundStatus)}`}>
                          {getStatusIcon(order.refundStatus)}
                          Refund {order.refundStatus}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <p>Total: <span className="font-semibold text-blue-600">{(order.totalPrice || 0).toLocaleString('en-US')} ETB</span></p>
                      <p>Status: <span className="font-medium capitalize">{order.status}</span></p>
                      {order.trackingNumber && (
                        <p>Tracking: <span className="font-mono">{order.trackingNumber}</span></p>
                      )}
                      <p className="mt-2">
                        Ordered on: {new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {order.refundReason && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Refund Reason:</p>
                        <p className="text-sm text-gray-600">{order.refundReason}</p>
                      </div>
                    )}
                    {order.refundStatus === 'rejected' && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">Your refund request was rejected. Please contact support for more information.</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!order.refundRequested || order.refundStatus === 'none' ? (
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Request Refund
                      </Button>
                    ) : (
                      <div className="text-sm text-gray-600 text-center">
                        Refund {order.refundStatus}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Refund Request Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 bg-white border-gray-200 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Request Refund for Order #{selectedOrder._id?.slice(-6)}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Refund <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Please explain why you need a refund..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedOrder(null);
                      setRefundReason('');
                    }}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRequestRefund(selectedOrder._id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!refundReason.trim()}
                  >
                    Submit Request
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

