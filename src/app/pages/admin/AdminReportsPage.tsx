import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { reportsAPI } from '../../../services/api';
import { Card } from '../../components/ui/card';

export default function AdminReportsPage() {
  const [sales, setSales] = useState<any>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await reportsAPI.getSales();
      setSales(res);
    } catch (err) { console.error(err); }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-bold">Sales Overview</h3>
            <pre className="mt-2 text-sm text-gray-400">{JSON.stringify(sales, null, 2)}</pre>
          </Card>
          <Card className="p-4">
            <h3 className="font-bold">Top Products</h3>
            {/* Could call reportsAPI.getTopProducts and render list */}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
