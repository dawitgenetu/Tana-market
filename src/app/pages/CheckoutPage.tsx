import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, Lock, CheckCircle, MapPin } from 'lucide-react';
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
    <div className="min-h-screen py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-slate-600">Complete your order with Chapa payment</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipping Address */}
          <Card className="p-6 bg-white border-blue-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="street" className="text-slate-700">Street Address</Label>
                <Input
                  id="street"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  placeholder="123 Main Street"
                  required
                  className="bg-white border-blue-200 text-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-slate-700">City</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="Addis Ababa"
                    required
                    className="bg-white border-blue-200 text-slate-900"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-slate-700">State/Region</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    placeholder="Addis Ababa"
                    required
                    className="bg-white border-blue-200 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode" className="text-slate-700">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    placeholder="1000"
                    required
                    className="bg-white border-blue-200 text-slate-900"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-slate-700">Country</Label>
                  <Input
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    placeholder="Ethiopia"
                    required
                    className="bg-white border-blue-200 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-6 bg-white border-blue-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Payment Method
            </h2>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-slate-900">Chapa Payment Gateway</p>
                  <p className="text-sm text-slate-600">You will be redirected to Chapa to complete your payment securely</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6 bg-white border-blue-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-slate-700">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</span>
                </div>
              ))}
              <div className="border-t border-blue-200 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span>{total.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Shipping</span>
                  <span>{shippingPrice.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Tax (15%)</span>
                  <span>{taxPrice.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}</span>
                </div>
                <div className="border-t border-blue-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {finalTotal.toLocaleString('en-US', { style: 'currency', currency: 'ETB' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Proceed to Chapa Payment
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
