import React, { useState } from "react";
import { Product, Review } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ReviewForm } from "./ReviewForm";
import { ReviewList } from "./ReviewList";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  reviews: Review[];
  onAddReview: (review: { productId: string; rating: number; comment: string; userName: string; userId: string }) => void;
}

export const ProductModal = React.memo(function ProductModal({ product, open, onClose, onAddToCart, reviews, onAddReview }: ProductModalProps) {
  if (!product) return null;

  const [imgSrc, setImgSrc] = React.useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const isArchived = product.status === 'archived';
  const { currentUser } = useAuth();

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  const handleSubmitReview = (review: { name: string; rating: number; comment: string }) => {
    if (!currentUser) {
      alert("You must be logged in to submit a review.");
      return;
    }
    onAddReview({
      rating: review.rating,
      comment: review.comment,
      userName: review.name,
      productId: product.id,
      userId: currentUser.uid,
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
                loading="lazy"
                width={320}
                height={224}
              />
              </div>
              {product.badge && (
                <span className="absolute top-2 left-2 md:top-4 md:left-4 bg-[#6FBF73] text-[#F9F7F1] text-xs md:text-sm font-semibold px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg uppercase tracking-widest">
                  {product.badge}
                </span>
              )}
              {isArchived && (
                <span className="absolute top-2 right-2 md:top-4 md:right-4 bg-gray-700 text-white text-xs md:text-sm font-semibold px-2 md:px-4 py-1 md:py-2 rounded-full shadow-lg uppercase tracking-widest z-20">Out of Stock</span>
              )}
            </div>
            {/* Content Section */}
            <div className="flex flex-col h-full min-h-0 bg-[#F9F7F1] lg:border-l border-[#FF6B35]/20">
              {/* Product Info */}
              <div className="p-4 md:p-6 border-b border-[#FF6B35]/20 flex-shrink-0">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold text-[#2F2F2F] mb-4">
                    {product.title}
                </h2>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <div className="text-sm text-green-600 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Delivery within 7 working days
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-[#FF6B35]">
                      ₹{product.price.toFixed(2)}
                    </div>
                    {product.gst > 0 && (
                      <div className="text-sm text-gray-600">
                        + {product.gst}% GST: ₹{(product.price * (product.gst / 100)).toFixed(2)}
                      </div>
                    )}
                    {product.shippingFee > 0 && (
                      <div className="text-sm text-gray-600">
                        + Shipping Fee: ₹{product.shippingFee.toFixed(2)}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-gray-800 pt-1">
                      Total: ₹{(product.price + (product.price * (product.gst / 100)) + product.shippingFee).toFixed(2)}
                    </div>
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
                          if (!isArchived) setQuantity(Math.max(1, quantity - 1));
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors ${isArchived ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#D7263D] text-[#F9F7F1] hover:bg-[#FF6B35]'}`}
                        disabled={isArchived}
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-[#2F2F2F]">{quantity}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!isArchived) setQuantity(quantity + 1);
                        }}
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold transition-colors ${isArchived ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#D7263D] text-[#F9F7F1] hover:bg-[#FF6B35]'}`}
                        disabled={isArchived}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={isArchived}
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isArchived) handleAddToCart();
                      }}
                      className={`w-auto px-6 py-2 font-bold rounded-xl transition-all duration-300 shadow-lg text-sm md:text-base touch-manipulation text-center ${isArchived ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#4CAF50] hover:bg-[#45a049] text-white'}`}
                      tabIndex={isArchived ? -1 : 0}
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
});
