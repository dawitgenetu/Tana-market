import React from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RatingStarsProps {
  rating: number;
  reviews?: number;
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  clickable?: boolean;
}

export default function RatingStars({ 
  rating, 
  reviews, 
  productId, 
  size = 'md',
  showNumber = true,
  clickable = true 
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const displayRating = rating || 0;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;

  const starsContent = (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return (
            <Star
              key={i}
              className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
            />
          );
        } else if (i === fullStars && hasHalfStar) {
          return (
            <Star
              key={i}
              className={`${sizeClasses[size]} fill-yellow-400/50 text-yellow-400`}
            />
          );
        } else {
          return (
            <Star
              key={i}
              className={`${sizeClasses[size]} text-gray-300`}
            />
          );
        }
      })}
      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">
          {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          {reviews !== undefined && reviews > 0 && (
            <span className="text-gray-500"> ({reviews})</span>
          )}
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link 
        to={`/product/${productId}`}
        className="inline-block hover:opacity-80 transition-opacity"
        onClick={(e) => {
          // Scroll to reviews section on product page
          setTimeout(() => {
            const reviewsSection = document.getElementById('reviews-section');
            if (reviewsSection) {
              reviewsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }}
      >
        {starsContent}
      </Link>
    );
  }

  return starsContent;
}

