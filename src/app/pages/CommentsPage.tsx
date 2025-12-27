import React, { useState } from 'react';
import { commentsAPI } from '../../services/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function CommentsPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to comment');
    try {
      await commentsAPI.create({ text, productId: null });
      toast.success('Comment submitted for review');
      setText('');
    } catch (e: any) { toast.error(e.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Send a Comment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} className="w-full p-3 bg-slate-800/50 border-cyan-500/30 text-white" placeholder="Share your feedback..." />
            <div>
              <Button type="submit">Send Comment</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
