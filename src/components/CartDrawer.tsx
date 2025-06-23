import { useEffect, useRef, useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CartItem, Product } from '@/lib/types';

// Helper function to get the display name of a product
const getProductName = (product: Product | string) => 
  typeof product === 'string' ? product : product.title;

// Helper function to get the display price of a product
const getProductPrice = (product: Product | number) => 
  typeof product === 'number' ? product : product.price;

// Helper function to get the image URL of a product
const getProductImage = (product: Product | string) => 
  typeof product === 'string' ? product : product.image;

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onUpdateQty: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
  loading: boolean;
}

export function CartDrawer({
  open,
  items = [],
  onUpdateQty,
  onRemove,
  onClose,
  onCheckout,
  loading = false
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();
  const prevItems = useRef<CartItem[]>([]);
  const [animateAddId, setAnimateAddId] = useState<string | null>(null);
  const [visible, setVisible] = useState(open);

  // Calculate cart total
  const getCartTotal = () => {
    return items.reduce((total, item) => total + (getProductPrice(item.product) * item.quantity), 0);
  };

  // Get total number of items in cart
  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Call the onCheckout prop which is passed from the parent component
      await onCheckout();
      
      // Show success toast (parent component might show its own toast as well)
      toast({
        title: 'Order placed successfully!',
        description: 'Your order has been received and is being processed.',
      });
      
      // Close the cart drawer
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
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
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-bold">Your Cart</h2>
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

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-gray-500 p-6 text-center">
                <ShoppingCart className="mb-4 h-16 w-16 text-gray-300" />
                <p className="mb-2 text-lg font-medium text-gray-700">Your cart is empty</p>
                <p className="mb-6 text-sm text-gray-500">Looks like you haven't added anything to your cart yet</p>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FFF5F0] hover:border-[#FF8C5A]"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const productName = getProductName(item.product);
                  const productPrice = getProductPrice(item.product);
                  const productImage = getProductImage(item.product);
                  const itemId = item.product.id;
                  
                  return (
                    <div
                      key={itemId}
                      className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                        animateAddId === itemId ? 'bg-green-50' : 'bg-white'
                      }`}
                    >
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                          <ShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{productName}</h3>
                        <p className="text-sm text-gray-500">₹{productPrice.toFixed(2)}</p>
                        <div className="mt-2 flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                            className="h-6 w-6 rounded-r-none border-r-0"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="flex h-6 w-8 items-center justify-center border border-gray-300 text-sm">
                            {item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                            className="h-6 w-6 rounded-l-none border-l-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          ₹{(productPrice * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(itemId)}
                          className="h-auto p-0 text-sm text-red-500 hover:bg-transparent hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="mb-4 flex justify-between text-lg font-semibold">
                <span className="text-gray-800">Subtotal</span>
                <span className="text-gray-900">₹{total.toFixed(2)}</span>
              </div>
              <p className="mb-4 text-sm text-gray-500 text-center">
                Shipping & taxes calculated at checkout
              </p>
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-[#D7263D] hover:bg-[#FF6B35] text-white font-medium py-3 text-base transition-colors duration-200"
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Proceed to Checkout'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
