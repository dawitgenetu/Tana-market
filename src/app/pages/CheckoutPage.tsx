import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const trackingNumber = `TANA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    clearCart();
    setLoading(false);
    toast.success('Order placed successfully!');
    navigate('/orders');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-gray-400">Complete your order</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-cyan-400" />
              Payment Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
                  className="bg-slate-700/50 border-cyan-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry" className="text-white">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    required
                    className="bg-slate-700/50 border-cyan-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-white">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    required
                    className="bg-slate-700/50 border-cyan-500/30 text-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-cyan-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-300">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-cyan-500/20 pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-cyan-400">${(total * 1.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Place Order Securely
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
