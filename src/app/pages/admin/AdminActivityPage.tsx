import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { activityAPI } from '../../../services/api';
import { Card } from '../../components/ui/card';
import { Activity } from 'lucide-react';

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await activityAPI.getAll(); setLogs(res || []); } catch (e) { console.error(e); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Activity Logs</h2>
        <div className="space-y-3">
          {logs.length === 0 ? (
            <Card className="p-12 bg-white border-gray-200 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No activity logs</h3>
              <p className="text-gray-600">Activity will appear here as users interact with the system</p>
            </Card>
          ) : (
            logs.map(l => (
              <Card key={l._id} className="p-4 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">
                      <span className="font-medium text-gray-900">{l.action}</span> • {new Date(l.createdAt).toLocaleString()}
                    </div>
                    {l.details && (
                      <div className="text-sm text-gray-600">{l.details}</div>
                    )}
                    {l.user && (
                      <div className="text-xs text-gray-500 mt-2">User: {l.user.name || l.user.email || 'System'}</div>
                    )}
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
