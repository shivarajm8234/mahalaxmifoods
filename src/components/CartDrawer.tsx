import { useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CartItem as LibCartItem, Product } from '@/lib/types';
import { CartItem as UtilsCartItem } from '@/utils/cartUtils';
import { toLibCartItem } from '@/utils/typeConverters';
import { CheckoutForm } from './CheckoutForm';

interface CartDrawerProps {
  open: boolean;
  items: LibCartItem[];
  onUpdateQty: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: (userData: any) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

// Helper functions removed as they're no longer needed

export function CartDrawer({
  open,
  items = [],
  onUpdateQty,
  onRemove,
  onClose,
  onCheckout,
  loading = false
}: CartDrawerProps) {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();
  const prevItems = useRef<LibCartItem[]>([]);
  const [animateAddId, setAnimateAddId] = useState<string | null>(null);
  const [visible, setVisible] = useState(open);

  // Calculate cart total
  const getCartTotal = () => {
    const total = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    return total;
  };

  // Get total number of items in cart
  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const handleProceedToCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleBackToCart = () => {
    setShowCheckoutForm(false);
  };

  const handleCheckoutSubmit = async (userData: any) => {
    setIsCheckingOut(true);
    try {
      const result = await onCheckout(userData);
      if (result.success) {
        toast({
          title: 'Order placed successfully!',
          description: 'Your order has been received and is being processed.',
          className: 'bg-green-500 text-white',
        });
        setShowCheckoutForm(false);
        onClose();
      } else {
        throw new Error(result.error || 'Failed to process order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'There was an error processing your order',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    onUpdateQty(itemId, newQuantity);
  };

  const handleRemove = (itemId: string) => {
    onRemove(itemId);
  };

  // Handle open/close animations
  useEffect(() => {
    if (open) setVisible(true);
    else setTimeout(() => setVisible(false), 350);
  }, [open]);

  // Animation when item is added
  useEffect(() => {
    if (items.length > prevItems.current.length) {
      // Find newly added product
      const added = items.find(
        (item) => !prevItems.current.some((old) => 
          old.product.id === item.product.id && old.quantity === item.quantity
        )
      );
      if (added) {
        setAnimateAddId(added.product.id);
        setTimeout(() => setAnimateAddId(null), 800);
      }
    }
    prevItems.current = [...items];
  }, [items]);

  // Close the cart when clicking on the overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!visible && !open) return null;

  const total = getCartTotal();
  const itemCount = getCartCount();

  // Render floating mini-cart if drawer closed
  if (!open && items.length > 0) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#FF6B35] border-2 border-[#FF6B35] rounded-none shadow-lg flex justify-between items-center px-3 md:px-4 py-2 animate-fade-in cursor-pointer hover:scale-105 transition duration-200 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-xl"
        onClick={() => setVisible(true)}
        aria-label="Open cart"
        tabIndex={0}
        role="button"
      >
        <span className="font-bold text-white text-sm md:text-base">
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
        <span className="text-white font-playfair font-bold text-lg">
          ₹{total.toFixed(2)}
        </span>
        <svg className="ml-1" width="20" height="20" fill="none">
          <path d="M6 8l4 4 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            {showCheckoutForm ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToCart}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Back to cart"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            ) : (
              <h2 className="text-lg font-bold">Your Cart ({itemCount})</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showCheckoutForm ? (
              <CheckoutForm 
                onCheckout={handleCheckoutSubmit} 
                loading={isCheckingOut}
                onBack={handleBackToCart}
                cartTotal={total}
              />
            ) : (
              <>
                <div className="p-4">
                  {items.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-center p-6">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                      <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
                      <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FFF5F0]"
                      >
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => {
                        const productName = item.product.title;
                        const productPrice = item.product.price;
                        const productImage = item.product.image;
                        
                        return (
                          <div key={item.product.id} className="flex items-start gap-4 border-b pb-4">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="flex items-center space-x-4">
                                  {item.product.image && (
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                                      <img
                                        src={item.product.image}
                                        alt={item.product.title}
                                        className="h-full w-full object-cover object-center"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                      {item.product.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {item.quantity} x ₹{item.product.price.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="text-sm font-medium text-gray-900">
                                  {productName}
                                </h3>
                                <p className="ml-4 font-medium text-gray-900">
                                  ₹{(productPrice * item.quantity).toFixed(2)}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">₹{productPrice.toFixed(2)} each</p>
                              <div className="mt-2 flex items-center">
                                <div className="flex items-center border border-gray-300 rounded-md">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                    className="h-8 w-8 p-0 rounded-r-none"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                    className="h-8 w-8 p-0 rounded-l-none"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemove(item.product.id)}
                                  className="ml-2 text-red-500 hover:text-red-700 hover:bg-transparent"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-gray-200 bg-white p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleProceedToCheckout}
                      className="mt-6 w-full bg-[#FF6B35] hover:bg-[#E55A2B] py-3 text-base"
                    >
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
