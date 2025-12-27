import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
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
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Managers & Customers</h2>
        <div className="grid gap-4">
          {users.map(u => (
            <Card key={u._id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{u.name} <span className="text-sm text-gray-400">({u.role})</span></div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
              <div className="flex gap-2">
                {u.role !== 'manager' && <Button onClick={() => handlePromote(u._id)}>Promote</Button>}
                {u.role === 'manager' && <Button onClick={() => handleDemote(u._id)} variant="outline">Demote</Button>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
