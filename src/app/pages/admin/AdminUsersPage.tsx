import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { usersAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handlePromote = async (id: string) => {
    try {
      await usersAPI.promoteToManager(id);
      toast.success('User promoted to manager');
      load();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  const handleDemote = async (id: string) => {
    try {
      await usersAPI.demoteToCustomer(id);
      toast.success('User demoted to customer');
      load();
    } catch (err: any) { toast.error(err.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Manage Managers & Customers</h2>
        <div className="grid gap-4">
          {users.map(u => (
            <Card key={u._id} className="p-6 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="font-bold text-gray-900 mb-1">{u.name} <span className="text-sm font-normal text-gray-500">({u.role})</span></div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <div className="flex gap-2">
                  {u.role !== 'manager' && u.role !== 'admin' && (
                    <Button onClick={() => handlePromote(u._id)} className="bg-blue-600 hover:bg-blue-700 text-white">Promote to Manager</Button>
                  )}
                  {u.role === 'manager' && (
                    <Button onClick={() => handleDemote(u._id)} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Demote to Customer</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
