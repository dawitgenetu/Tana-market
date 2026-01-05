import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
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
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Reports & Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Sales Overview</h3>
            {sales ? (
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Sales:</span>
                  <span className="font-bold text-blue-600">{(sales.totalSales || 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-bold text-gray-900">{sales.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Average Order Value:</span>
                  <span className="font-bold text-gray-900">{(sales.averageOrderValue || 0).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading sales data...</p>
            )}
          </Card>
          <Card className="p-6 bg-white border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Top Products</h3>
            <p className="text-gray-500">Product analytics coming soon</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
