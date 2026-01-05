import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { commentsAPI } from '../../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await commentsAPI.getAll(); setComments(res || []); } catch (e) { console.error(e); }
  };

  const handleApprove = async (id: string) => {
    try { await commentsAPI.approve(id); toast.success('Approved'); load(); } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete comment?')) return;
    try { await commentsAPI.delete(id); toast.success('Deleted'); load(); } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Manage Comments</h2>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <Card className="p-12 bg-white border-gray-200 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No comments to review</h3>
              <p className="text-gray-600">All comments have been processed</p>
            </Card>
          ) : (
            comments.map(c => (
              <Card key={c._id} className="p-6 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-2">{c.user?.name || c.email}</div>
                    <div className="text-sm text-gray-600 mb-2">{c.comment || c.text}</div>
                    {c.product && (
                      <div className="text-xs text-gray-500">Product: {c.product.name || c.product}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApprove(c._id)} className="bg-blue-600 hover:bg-blue-700 text-white">Approve</Button>
                    <Button variant="outline" onClick={() => handleDelete(c._id)} className="border-gray-300 text-gray-700 hover:bg-gray-50">Delete</Button>
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
