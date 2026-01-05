import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { ordersAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimatedDays, setEstimatedDays] = useState<{ [key: string]: string }>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await ordersAPI.getAll();
      const ordersList = Array.isArray(res) ? res : res.data || [];
      setOrders(ordersList);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleApprove = async (id: string, days?: number) => {
    try {
      const daysToShip = days || parseInt(estimatedDays[id] || '0');
      await ordersAPI.approve(id, daysToShip > 0 ? daysToShip : undefined);
      toast.success('Order approved and shipped');
      setEstimatedDays(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve order');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this order? The customer will need to order again.')) return;
    try {
      await ordersAPI.cancel(id);
      toast.success('Order rejected');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject order');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Approve / Reject Orders</h2>
        <div className="space-y-4">
          {pendingOrders.length === 0 ? (
            <Card className="p-12 bg-white border-gray-200 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders to review</h3>
              <p className="text-gray-600">All orders have been processed</p>
            </Card>
          ) : (
            pendingOrders.map(o => (
              <Card key={o._id} className="p-6 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-2">Order #{o._id?.slice(-6) || 'N/A'}</div>
                      <div className="text-sm text-gray-600 mb-1">Status: <span className="font-medium capitalize">{o.status}</span></div>
                      <div className="text-sm text-gray-600 mb-1">Total: <span className="font-semibold text-blue-600">{(o.totalPrice || o.total || 0).toLocaleString('en-US')} ETB</span></div>
                      {o.user && (
                        <div className="text-sm text-gray-500 mt-2">Customer: {o.user.name || o.user.email}</div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="3"
                          max="60"
                          placeholder="Days (3-60)"
                          value={estimatedDays[o._id] || ''}
                          onChange={(e) => setEstimatedDays(prev => ({ ...prev, [o._id]: e.target.value }))}
                          className="w-24"
                        />
                        <Button 
                          onClick={() => handleApprove(o._id, parseInt(estimatedDays[o._id] || '0'))} 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Approve & Ship
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReject(o._id)} 
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
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
