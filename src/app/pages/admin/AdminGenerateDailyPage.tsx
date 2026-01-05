import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { reportsAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
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
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Generate Daily Report</h2>
        <Card className="p-6 bg-white border-gray-200 shadow-sm max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
