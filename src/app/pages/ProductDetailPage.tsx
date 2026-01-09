import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { productsAPI } from '../../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await productsAPI.getById(id || '');
        if (!mounted) return;
        setProduct(data);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    return () => { mounted = false };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-slate-600">Product not found</h2>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Check stock availability
    const availableStock = product.stock !== undefined ? product.stock : (product.inStock ? 999 : 0);
    if (availableStock < quantity) {
      toast.error(`Only ${availableStock} items available in stock`);
      return;
    }

    addItem({
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image
    });
    toast.success('Added to cart!');
  };

  const availableStock = product.stock !== undefined ? product.stock : (product.inStock ? 999 : 0);
  const isInStock = availableStock > 0;

  return (
    <div className="min-h-screen py-12 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate('/products')}
            variant="ghost"
            className="group text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Collection
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-contain mix-blend-multiply"
              />
            </div>
          </motion.div>

          {/* Product Info - Sticky */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:sticky md:top-24 h-fit"
          >
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 px-4 py-1.5 text-sm font-medium rounded-full">
                    {product.category}
                  </Badge>
                  {isInStock && (
                    <span className="text-emerald-600 text-sm font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-6">
                  <div className="text-3xl font-bold text-slate-900">
                    {(product.price || 0).toLocaleString('en-US')} <span className="text-lg text-slate-500 font-medium">ETB</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(product.rating)
                              ? 'text-amber-400 fill-current'
                              : 'text-slate-200'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500 font-medium underline decoration-slate-300 underline-offset-4">
                      {product.reviews} reviews
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate text-slate-600 border-t border-b border-slate-100 py-6">
                <p className="leading-relaxed text-lg">{product.description}</p>
              </div>

              {/* Actions Area */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-slate-700 font-medium">Quantity</span>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-9 w-9 bg-white shadow-sm hover:bg-white text-slate-900 disabled:opacity-50 rounded-lg"
                      disabled={!isInStock || quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-slate-900 tabular-nums">{quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                      className="h-9 w-9 bg-white shadow-sm hover:bg-white text-slate-900 disabled:opacity-50 rounded-lg"
                      disabled={!isInStock || quantity >= availableStock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-1 h-14 bg-slate-900 hover:bg-blue-600 text-white text-lg rounded-xl transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-blue-600/30"
                    disabled={!isInStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isInStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {[
                  { icon: Truck, text: "Free shipping over 50 ETB" },
                  { icon: Shield, text: "2-year warranty" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 text-slate-600 text-sm font-medium">
                    <item.icon className="w-5 h-5 text-blue-600" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Extended Details Section */}
        <div className="mt-24 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Customer Customer Reviews</h2>
                <Link to={`/dashboard/ratings`}>
                  <Button variant="outline" className="border-slate-200">Write a Review</Button>
                </Link>
              </div>
              <Card className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-200 shadow-none rounded-2xl">
                <div className="max-w-sm mx-auto">
                  <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No reviews yet</h3>
                  <p className="text-slate-500">Be the first to share your thoughts on this product.</p>
                </div>
              </Card>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
