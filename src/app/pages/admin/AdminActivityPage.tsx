import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { activityAPI } from '../../../services/api';
import { Card } from '../../components/ui/card';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await activityAPI.getAll(); setLogs(res || []); } catch (e) { console.error(e); }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
        <div className="space-y-2">
          {logs.map(l => (
            <Card key={l._id} className="p-3">
              <div className="text-sm text-gray-400">{new Date(l.createdAt).toLocaleString()} • {l.action}</div>
              <div className="text-sm">{l.details}</div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
