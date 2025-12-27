import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden bg-white border-blue-200 hover:border-blue-400 transition-all group h-full flex flex-col shadow-sm hover:shadow-lg">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <span>{product.rating}</span>
        </div>
        {product.inStock && (
          <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm shadow-md">
            In Stock
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="text-sm text-blue-600 font-medium mb-2">{product.category}</div>
        <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">{product.name}</h3>
        <p className="text-slate-600 mb-4 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <div>
            <div className="text-2xl font-bold text-blue-600">${product.price}</div>
            <div className="text-sm text-slate-500">{product.reviews} reviews</div>
          </div>
          <Link to={`/product/${product.id}`}>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">View</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
