import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { reportsAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

export default function AdminGenerateDailyPage() {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await reportsAPI.generateDaily(date || undefined);
      toast.success('Daily report generated');
    } catch (e: any) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Generate Daily Report</h2>
        <div className="space-y-4 max-w-sm">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 bg-slate-800/50 border-cyan-500/30 text-white" />
          <Button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
