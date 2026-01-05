import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productsAPI, commentsAPI } from '../../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Star, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function RatingPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAll();
      const productsList = Array.isArray(data) ? data : data.data || [];
      setProducts(productsList);
      
      // Load existing ratings and comments
      const ratingsMap: { [key: string]: number } = {};
      const commentsMap: { [key: string]: string } = {};
      
      for (const product of productsList) {
        try {
          const productComments = await commentsAPI.getByProduct(product._id || product.id);
          const commentsList = Array.isArray(productComments) ? productComments : productComments.data || [];
          const userComment = commentsList.find((c: any) => c.user?._id === user?._id || c.user === user?._id);
          if (userComment) {
            ratingsMap[product._id || product.id] = userComment.rating;
            commentsMap[product._id || product.id] = userComment.comment;
          }
        } catch (err) {
          // Product might not have comments yet
        }
      }
      
      setRatings(ratingsMap);
      setComments(commentsMap);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (productId: string, rating: number) => {
    if (rating >= 1 && rating <= 5) {
      setRatings(prev => ({ ...prev, [productId]: Number(rating) }));
    }
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setComments(prev => ({ ...prev, [productId]: comment }));
  };

  const submitRating = async (productId: string) => {
    try {
      const rating = ratings[productId];
      const comment = comments[productId] || '';

      if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        toast.error('Please select a valid rating (1-5 stars)');
        return;
      }

      if (!comment.trim()) {
        toast.error('Please add a comment');
        return;
      }

      const result = await commentsAPI.create({
        productId: productId,
        rating: Number(rating), // Ensure it's a number
        comment: comment.trim(),
      });

      // If user is admin/manager, auto-approve the comment
      if (user && (user.role === 'admin' || user.role === 'manager')) {
        try {
          await commentsAPI.approve(result._id || result.id);
        } catch (err) {
          console.error('Error auto-approving comment:', err);
        }
      }

      toast.success('Rating submitted successfully');
      // Reload to get updated ratings
      await loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit rating');
    }
  };

  const updateRating = async (productId: string, commentId: string) => {
    try {
      const rating = ratings[productId];
      const comment = comments[productId] || '';

      if (!rating) {
        toast.error('Please select a rating');
        return;
      }

      if (!comment.trim()) {
        toast.error('Please add a comment');
        return;
      }

      // Note: You might need to add an update endpoint to commentsAPI
      await commentsAPI.create({
        productId: productId,
        rating: rating,
        comment: comment.trim(),
      });

      toast.success('Rating updated successfully');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update rating');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rate Products</h2>
          <p className="text-gray-600">Share your experience and rate the products you've purchased</p>
        </div>

        {products.length === 0 ? (
          <Card className="p-12 bg-white border-gray-200 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-600">Products will appear here once they are added</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const productId = product._id || product.id;
              const currentRating = ratings[productId] || 0;
              const currentComment = comments[productId] || '';

              return (
                <Card key={productId} className="p-6 bg-white border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <Link to={`/product/${productId}`}>
                        <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                      <p className="text-lg font-semibold text-blue-600 mt-2">
                        {(product.price || 0).toLocaleString('en-US')} ETB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRating(productId, star)}
                            className="focus:outline-none"
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= currentRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              } hover:text-yellow-400 transition-colors`}
                            />
                          </button>
                        ))}
                      </div>
                      {currentRating > 0 && (
                        <p className="text-xs text-gray-500 mt-1">Selected: {currentRating} star{currentRating > 1 ? 's' : ''}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Comment</label>
                      <textarea
                        value={currentComment}
                        onChange={(e) => handleCommentChange(productId, e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={() => submitRating(productId)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!currentRating || !currentComment.trim()}
                    >
                      {currentRating && currentComment ? 'Update Rating' : 'Submit Rating'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

