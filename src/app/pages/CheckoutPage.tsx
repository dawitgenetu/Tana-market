import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, Lock, CheckCircle, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useCart } from '../context/CartContext';
import { ordersAPI, cartAPI } from '../../services/api';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sync cart items to backend
      for (const item of items) {
        try {
          await cartAPI.addItem(item.id, item.quantity);
        } catch (err) {
          // Item might already be in cart, continue
          console.log('Item sync:', err);
        }
      }

      // Create order (backend will use cart from database)
      const order = await ordersAPI.create({
        shippingAddress
      });

      // Initialize Chapa payment
      const paymentData = await ordersAPI.initializePayment(order._id || order.id);

      // Clear local cart
      clearCart();

      // Redirect to Chapa checkout
      if (paymentData.checkout_url) {
        window.location.href = paymentData.checkout_url;
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process checkout');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingPrice = 50;
  const taxPrice = total * 0.15;
  const finalTotal = total + shippingPrice + taxPrice;

  return (
    <div className="min-h-screen py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Secure Checkout
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Lock className="w-4 h-4" />
            <span>Encrypted and Secure</span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">1</div>
                  <h2 className="text-xl font-bold text-slate-900">Shipping Address</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street" className="text-slate-700 font-medium ml-1">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="123 Main Street"
                      required
                      className="bg-slate-50 border-slate-200 text-slate-900 mt-1.5 h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-slate-700 font-medium ml-1">City</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        placeholder="Addis Ababa"
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-slate-700 font-medium ml-1">State/Region</Label>
                      <Input
                        id="state"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        placeholder="Addis Ababa"
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 mt-1.5 h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode" className="text-slate-700 font-medium ml-1">Zip Code</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                        placeholder="1000"
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 mt-1.5 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-slate-700 font-medium ml-1">Country</Label>
                      <Input
                        id="country"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                        placeholder="Ethiopia"
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 mt-1.5 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">2</div>
                  <h2 className="text-xl font-bold text-slate-900">Payment Method</h2>
                </div>

                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">Pay with Chapa</p>
                    <p className="text-sm text-slate-600">Secure payment gateway for Ethiopian banks</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24"
            >
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h3>

                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-medium text-slate-900 shrink-0">
                        {(item.price * item.quantity).toLocaleString('en-US')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>{total.toLocaleString('en-US')} ETB</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>{shippingPrice.toLocaleString('en-US')} ETB</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (15%)</span>
                    <span>{taxPrice.toLocaleString('en-US')} ETB</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {finalTotal.toLocaleString('en-US')} <span className="text-sm text-slate-500 font-medium">ETB</span>
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full h-12 mt-8 bg-slate-900 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
