import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { useCart, CartItem as CartItemType } from '../context/CartContext';
import QuantitySelector from './QuantitySelector';
import { toast } from 'sonner';

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <Card className="p-4 bg-slate-800/50 border-cyan-500/20">
      <div className="flex gap-4">
        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
          <div className="text-2xl font-bold text-cyan-400 mb-4">{item.price.toLocaleString('en-US')} ETB</div>
          <div className="flex items-center gap-4">
            <QuantitySelector value={item.quantity} onChange={(q) => updateQuantity(item.id, q)} />
            <Button size="sm" variant="ghost" onClick={() => { removeItem(item.id); toast.success('Item removed from cart'); }} className="text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white">{(item.price * item.quantity).toLocaleString('en-US')} ETB</div>
        </div>
      </div>
    </Card>
  );
}
