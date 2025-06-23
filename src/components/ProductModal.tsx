import React, { useState } from "react";
import { Product, Review } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { X } from "lucide-react";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  reviews: Review[];
  onAddReview: (reviewData: { rating: number; comment: string; userName: string }) => void;
}

export function ProductModal({ product, open, onClose, onAddToCart, reviews, onAddReview }: ProductModalProps) {
  if (!product) return null;

  const [imgSrc, setImgSrc] = React.useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  const handleSubmitReview = (review: { name: string; rating: number; comment: string }) => {
    onAddReview({
      rating: review.rating,
      comment: review.comment,
      userName: review.name
    });
    setShowReviewForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-full h-[100dvh] max-w-full max-h-[100dvh] p-0 animate-scale-in rounded-none shadow-none border-0 mx-0 bg-[#F9F7F1]
        sm:max-w-4xl sm:h-[90vh] sm:!rounded-[25px] sm:overflow-hidden sm:shadow-2xl sm:border sm:border-[#FF6B35] sm:mx-4 sm:p-0"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <DialogDescription className="sr-only">
          Product details and reviews for {product.title}
        </DialogDescription>
        <div className="relative h-full flex flex-col min-h-0 w-full overflow-y-auto sm:overflow-visible" style={{ maxHeight: '100dvh' }}>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-[#F9F7F1]/80 hover:bg-[#F9F7F1] rounded-full p-2 transition-colors"
          >
            <X className="h-4 w-4 md:h-5 md:w-5 text-[#2F2F2F]" />
          </button>
          <div className="flex-1 min-h-0 h-full flex flex-col lg:grid lg:grid-cols-[1fr_1.5fr] gap-0">
            {/* Image Section */}
            <div className="relative h-64 sm:h-80 lg:h-[32rem] lg:min-h-[32rem] lg:max-h-[32rem] w-full lg:w-auto flex-shrink-0 bg-[#F9F7F1]">
              <div className="w-full h-full flex items-center justify-center">
              <img
                src={imgSrc}
                alt={`Masala product: ${product.title}`}
                  className="max-w-full max-h-full object-contain"
                onError={() => setImgSrc("/placeholder.svg")}
              />
              </div>
              {product.badge && (
                <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-[#6FBF73] text-[#F9F7F1] text-xs md:text-sm font-semibold px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg uppercase tracking-widest">
                  {product.badge}
                </span>
              )}
            </div>
            {/* Content Section */}
            <div className="flex flex-col h-full min-h-0 bg-[#F9F7F1] lg:border-l border-[#FF6B35]/20">
              {/* Product Info */}
              <div className="p-4 md:p-6 border-b border-[#FF6B35]/20 flex-shrink-0">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-[#2F2F2F] mb-4">
                    {product.title}
                </h2>
                <p className="text-sm md:text-base text-[#2F2F2F]/80 leading-relaxed mb-6">
                    {product.description}
                  </p>
                <div className="space-y-4">
                  <div className="text-2xl md:text-3xl font-bold text-[#FF6B35]">
                    ₹{product.price.toFixed(2)}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#2F2F2F] text-sm md:text-base">Perfect for:</h4>
                    <ul className="text-[#2F2F2F]/80 space-y-1 text-sm md:text-base">
                      <li>• Traditional Indian cooking</li>
                      <li>• Adding authentic flavors to any dish</li>
                      <li>• Creating restaurant-quality meals at home</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuantity(Math.max(1, quantity - 1));
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#D7263D] text-[#F9F7F1] font-bold hover:bg-[#FF6B35] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-[#2F2F2F]">{quantity}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuantity(quantity + 1);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#D7263D] text-[#F9F7F1] font-bold hover:bg-[#FF6B35] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      className="w-auto px-6 py-2 bg-[#D7263D] hover:bg-[#FF6B35] text-[#F9F7F1] font-bold rounded-xl transition-all duration-300 shadow-lg text-sm md:text-base touch-manipulation"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
              {/* Reviews Section: scrollable only on desktop */}
              <div className="flex-1 min-h-0 p-4 md:p-6 sm:overflow-y-auto overflow-y-visible">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-[#2F2F2F]">Reviews</h3>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="text-[#D7263D] hover:text-[#FF6B35] font-medium transition-colors"
                  >
                    Write a Review
                  </button>
                </div>
                {showReviewForm ? (
                  <ReviewForm
                    onSubmit={handleSubmitReview}
                    onCancel={() => setShowReviewForm(false)}
                  />
                ) : (
                  <ReviewList reviews={reviews.filter(r => r.productId === product.id)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
