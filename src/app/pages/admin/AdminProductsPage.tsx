import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { productsAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await productsAPI.getAll();
      const items = Array.isArray(res) ? res : res.data || [];
      setProducts(items);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      load();
    } catch (err: any) { toast.error(err.message || 'Delete failed'); }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Products</h2>
          <Button onClick={() => window.location.href = '/admin/products/new'}>Create Product</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(p => (
            <Card key={p.id || p._id} className="p-4">
              <div className="flex items-start gap-4">
                <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm text-gray-400">{p.category}</div>
                  <div className="mt-2">${p.price}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => window.location.href = `/admin/products/edit/${p.id || p._id}`} variant="outline">Edit</Button>
                <Button onClick={() => handleDelete(p.id || p._id)} variant="destructive">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
