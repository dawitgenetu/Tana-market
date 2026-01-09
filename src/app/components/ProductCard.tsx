import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import RatingStars from './RatingStars';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="h-full overflow-hidden bg-white border-0 shadow-sm hover:shadow-2xl transition-all duration-300 rounded-2xl group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {((product.stock !== undefined && product.stock > 0) || product.inStock) ? (
          <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
            In Stock
          </div>
        ) : (
          <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
            Out of Stock
          </div>
        )}

        {product.category && (
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
            {product.category}
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{product.description}</p>

        <div className="mb-4">
          <RatingStars
            rating={product.rating || 0}
            reviews={product.reviews || product.numReviews || 0}
            productId={product.id || product._id}
            size="sm"
            clickable={true}
          />
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Price</span>
            <div className="text-xl font-bold text-slate-900">{(product.price || 0).toLocaleString('en-US')} ETB</div>
          </div>
          <Link to={`/product/${product.id || product._id}`}>
            <Button size="sm" className="rounded-full px-6 bg-slate-900 hover:bg-blue-600 transition-colors duration-300">
              View
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
