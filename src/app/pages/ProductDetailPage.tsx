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
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button
            onClick={() => navigate('/products')}
            variant="ghost"
            className="mb-8 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="overflow-hidden bg-white border-blue-200 shadow-sm">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
                src={product.image}
                alt={product.name}
                className="w-full h-auto"
              />
            </Card>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-blue-600 fill-current'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-slate-600 ml-2">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-700 text-lg">
              {product.description}
            </p>

            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {(product.price || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} ETB
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Free shipping on orders over 50 ETB</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>2-year warranty included</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Star className="w-5 h-5 text-blue-600 fill-current" />
                <span>Rated {product.rating}/5 by customers</span>
              </div>
            </div>

            {/* Stock Info */}
            {product.stock !== undefined && (
              <div className={`text-sm font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                {isInStock ? `${availableStock} items in stock` : 'Out of stock'}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={!isInStock}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-slate-900 px-4 font-semibold">{quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  disabled={!isInStock || quantity >= availableStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg py-6 shadow-lg"
                disabled={!isInStock}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isInStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
          id="reviews-section"
        >
          <Card className="p-8 bg-white border-blue-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews & Ratings</h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">View and manage product reviews</p>
              <Link to={`/dashboard/ratings`}>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                  Rate This Product
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Additional Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-8 bg-white border-blue-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Product Details</h2>
            <div className="grid md:grid-cols-2 gap-6 text-slate-700">
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Specifications</h3>
                <ul className="space-y-2">
                  <li>• Advanced AI-powered technology</li>
                  <li>• High-performance components</li>
                  <li>• Eco-friendly materials</li>
                  <li>• Global warranty coverage</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">What's Included</h3>
                <ul className="space-y-2">
                  <li>• {product.name}</li>
                  <li>• User manual</li>
                  <li>• Warranty card</li>
                  <li>• Premium packaging</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
