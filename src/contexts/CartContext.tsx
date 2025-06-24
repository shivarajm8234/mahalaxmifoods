import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { 
  CartItem, 
  addToCart as addToCartUtil, 
  removeFromCart as removeFromCartUtil, 
  updateCartItemQuantity as updateCartItemQuantityUtil, 
  getCart as getCartUtil, 
  clearCart as clearCartUtil, 
  checkout as checkoutUtil,
  syncCart
} from '@/utils/cartUtils';
import { useAuth } from './AuthContext';

type CartContextType = {
  items: CartItem[];
  cart: CartItem[]; // Alias for items for backward compatibility
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  checkout: (userData: any) => Promise<{ success: boolean; error?: any }>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load and sync cart when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (currentUser) {
          // Sync with server if user is authenticated
          const syncedCart = await syncCart(currentUser.uid);
          setItems(syncedCart);
        } else {
          // Just load from local storage if not authenticated
          const localCart = getCartUtil();
          setItems(localCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to local storage on error
        setItems(getCartUtil());
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [currentUser]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const newItems = await addToCartUtil(
      { ...item, quantity: item.quantity || 1 },
      currentUser?.uid
    );
    setItems(newItems);
    return newItems;
  }, [currentUser?.uid]);

  const removeFromCart = useCallback(async (itemId: string) => {
    const newItems = await removeFromCartUtil(itemId, currentUser?.uid);
    setItems(newItems);
    return newItems;
  }, [currentUser?.uid]);

  const updateCartItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }
    const newItems = await updateCartItemQuantityUtil(itemId, quantity, currentUser?.uid);
    setItems(newItems);
    return newItems;
  }, [currentUser?.uid, removeFromCart]);

  const clearCart = useCallback(async () => {
    await clearCartUtil(currentUser?.uid);
    setItems([]);
  }, [currentUser?.uid]);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const checkout = useCallback(async (userData: any) => {
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const result = await checkoutUtil(items, currentUser.uid, userData);
      if (result.success) {
        setItems([]);
      }
      return result;
    } catch (error) {
      console.error('Checkout error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred during checkout' 
      };
    }
  }, [currentUser, items]);

  const value = useMemo(() => ({
    items,
    cart: items, // Alias for backward compatibility
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    checkout,
  }), [items, addToCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal, getCartCount, checkout]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
