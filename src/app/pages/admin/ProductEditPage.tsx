import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { productsAPI } from '../../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: '0',
    stock: '0',
    category: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const product = await productsAPI.getById(id!);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        discount: product.discount?.toString() || '0',
        stock: product.stock?.toString() || '0',
        category: product.category || '',
        image: product.image || '',
      });
      // Default to URL mode if an image URL already exists
      setImageMode('url');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load product');
      navigate('/dashboard/products');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      const baseData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        stock: parseInt(formData.stock),
      };

      if (imageMode === 'upload' && imageFile) {
        const fd = new FormData();
        fd.append('name', baseData.name);
        fd.append('description', baseData.description);
        fd.append('price', String(baseData.price));
        fd.append('discount', String(baseData.discount));
        fd.append('stock', String(baseData.stock));
        fd.append('category', baseData.category);
        if (baseData.image) {
          fd.append('image', baseData.image);
        }
        fd.append('imageFile', imageFile);
        await productsAPI.update(id, fd);
      } else {
        await productsAPI.update(id, baseData);
      }
      toast.success('Product updated successfully');
      navigate('/dashboard/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/products')}
            className="mb-4 text-gray-700 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>

          <Card className="p-6 bg-white border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={4}
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (ETB)</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <Input
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                  >
                    <option value="" disabled>Select a category</option>
                    {[
                      'Beverages', 'Kitchen', 'Groceries', 'Accessories', 'Electronics', 'Home', 'Garden', 'Toys', 'Books', 'Clothing',
                      'Footwear', 'Beauty', 'Sports', 'Automotive', 'Health', 'Office', 'Pets', 'Baby', 'Jewelry', 'Outdoors'
                    ].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      imageMode === 'url'
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-gray-300 text-gray-600 bg-white'
                    }`}
                  >
                    Use Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1 text-sm rounded-md border ${
                      imageMode === 'upload'
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-gray-300 text-gray-600 bg-white'
                    }`}
                  >
                    Upload Image File
                  </button>
                </div>

                {imageMode === 'url' ? (
                  <Input
                    required={!imageFile}
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full"
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <input
                    required={!formData.image}
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                    }}
                  />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/products')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

