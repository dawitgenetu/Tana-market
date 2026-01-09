import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <ShoppingBag className="w-24 h-24 text-slate-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
          <p className="text-slate-600 mb-8">Start shopping to add items to your cart</p>
          <Link to="/products">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
              Browse Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleRemove = (id: string) => {
    removeItem(id);
    toast.success('Item removed from cart');
  };

  return (
    <div className="min-h-screen py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-baseline justify-between mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-slate-500 font-medium">{items.length} items</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <CartItem item={item} />
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{total.toLocaleString('en-US')} ETB</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (15%)</span>
                  <span className="font-medium text-slate-900">{(total * 0.15).toLocaleString('en-US')} ETB</span>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-900 font-bold text-lg">Total</span>
                    <span className="text-3xl font-bold text-slate-900">
                      {(total + total * 0.15).toLocaleString('en-US')} <span className="text-base font-medium text-slate-500">ETB</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white text-lg rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 transition-all duration-300"
                >
                  Checkout <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <Shield className="w-4 h-4" />
                  Secure Checkout
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
