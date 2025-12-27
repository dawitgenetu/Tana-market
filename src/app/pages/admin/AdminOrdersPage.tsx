import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
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
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Approve / Reject Orders</h2>
        <div className="space-y-4">
          {orders.map(o => (
            <Card key={o._id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{o.trackingNumber || o._id}</div>
                  <div className="text-sm text-gray-400">{o.status} • {o.totalPrice || o.total}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(o._id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleReject(o._id)}>Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
