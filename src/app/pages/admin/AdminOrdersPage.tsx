import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ordersAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
    try { await ordersAPI.approve(id); toast.success('Order approved'); load(); } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this order?')) return;
    try { await ordersAPI.cancel(id); toast.success('Order rejected'); load(); } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Approve / Reject Orders</h2>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-12 bg-white border-gray-200 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders to review</h3>
              <p className="text-gray-600">All orders have been processed</p>
            </Card>
          ) : (
            orders.map(o => (
              <Card key={o._id} className="p-6 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <div className="font-bold text-gray-900 mb-2">Order #{o._id?.slice(-6) || o.trackingNumber || 'N/A'}</div>
                    <div className="text-sm text-gray-600 mb-1">Status: <span className="font-medium">{o.status}</span></div>
                    <div className="text-sm text-gray-600">Total: <span className="font-semibold text-blue-600">{(o.totalPrice || o.total || 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</span></div>
                    {o.user && (
                      <div className="text-sm text-gray-500 mt-2">Customer: {o.user.name || o.user.email}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(o._id)} className="bg-blue-600 hover:bg-blue-700 text-white">Approve</Button>
                    <Button variant="outline" onClick={() => handleReject(o._id)} className="border-gray-300 text-gray-700 hover:bg-gray-50">Reject</Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
