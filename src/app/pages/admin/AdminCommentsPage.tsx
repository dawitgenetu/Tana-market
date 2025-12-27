import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { commentsAPI } from '../../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Comments</h2>
        <div className="space-y-4">
          {comments.map(c => (
            <Card key={c._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{c.user?.name || c.email}</div>
                  <div className="text-sm text-gray-400">{c.text}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(c._id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleDelete(c._id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
