import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { productsAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Package, Edit2, Save, X } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

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

  const startEditingStock = (product: any) => {
    setEditingStock(product.id || product._id);
    setStockValue(product.stock || 0);
  };

  const cancelEditingStock = () => {
    setEditingStock(null);
    setStockValue(0);
  };

  const saveStock = async (productId: string) => {
    try {
      const product = products.find(p => (p.id || p._id) === productId);
      if (!product) return;

      await productsAPI.update(productId, { stock: stockValue });
      toast.success('Stock updated successfully');
      setEditingStock(null);
      load();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock');
    }
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
            <Card key={p.id || p._id} className="p-4 bg-white border-blue-200">
              <div className="flex items-start gap-4">
                <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <div className="text-sm text-slate-600">{p.category}</div>
                  <div className="mt-2 text-lg font-semibold text-blue-600">${p.price}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {editingStock === (p.id || p._id) ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={stockValue}
                          onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveStock(p.id || p._id)}
                          className="h-8 px-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditingStock}
                          className="h-8 px-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Package className={`w-4 h-4 ${(p.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-sm font-medium ${(p.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Stock: {p.stock || 0} units
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingStock(p)}
                          className="h-6 px-2 text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => window.location.href = `/admin/products/edit/${p.id || p._id}`} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">Edit</Button>
                <Button onClick={() => handleDelete(p.id || p._id)} variant="destructive">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
