import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { productsAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { Package, Edit2, Save, X } from 'lucide-react';

export default function AdminProductsPage() {
  const navigate = useNavigate();
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
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">CRUD Products</h2>
          <Button onClick={() => navigate('/dashboard/products/new')} className="bg-blue-600 hover:bg-blue-700 text-white">Create Product</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(p => (
            <Card key={p.id || p._id} className="p-4 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
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
                          className="h-8 px-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEditingStock}
                          className="h-8 px-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Package className={`w-4 h-4 ${(p.stock || 0) > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${(p.stock || 0) > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
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
                <Button onClick={() => navigate(`/dashboard/products/edit/${p.id || p._id}`)} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">Edit</Button>
                <Button onClick={() => handleDelete(p.id || p._id)} variant="destructive" className="bg-gray-600 hover:bg-gray-700">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
