import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { 
  CartItem, 
  addToCart as addToCartUtil, 
  removeFromCart as removeFromCartUtil, 
  updateCartItemQuantity as updateCartItemQuantityUtil, 
  getCart as getCartUtil, 
  clearCart as clearCartUtil, 
  checkout as checkoutUtil,
  syncCart,
  clearCartForNewUser
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
  const [previousUser, setPreviousUser] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Load and sync cart when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (currentUser) {
          // Check if this is a different user (user switch)
          if (previousUser && previousUser !== currentUser.uid) {
            console.log('User switched. Clearing previous cart data.');
            clearCartForNewUser();
          }
          
          // Sync with server if user is authenticated
          const syncedCart = await syncCart(currentUser.uid);
          setItems(syncedCart);
          setPreviousUser(currentUser.uid);
        } else {
          // Clear cart when user signs out to prevent cart persistence between users
          console.log('User signed out. Clearing cart.');
          setItems([]);
          // Also clear localStorage to prevent cart persistence
          clearCartForNewUser();
          setPreviousUser(null);
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
  }, [currentUser, previousUser]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const newItem = { ...item, quantity: item.quantity || 1 };
    
    // Optimistic update - update UI immediately
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === newItem.id);
      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });

    // Save to Firestore in background
    try {
      await addToCartUtil(newItem, currentUser?.uid);
    } catch (error) {
      console.error('Error saving cart to Firestore:', error);
      // Optionally revert on error, but for now just log
    }
  }, [currentUser?.uid]);

  const removeFromCart = useCallback(async (itemId: string) => {
    // Optimistic update - update UI immediately
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));

    // Save to Firestore in background
    try {
      await removeFromCartUtil(itemId, currentUser?.uid);
    } catch (error) {
      console.error('Error removing item from Firestore:', error);
      // Optionally revert on error, but for now just log
    }
  }, [currentUser?.uid]);

  const updateCartItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }
    
    // Optimistic update - update UI immediately
    setItems(prevItems => {
      const itemIndex = prevItems.findIndex(item => item.id === itemId);
      if (itemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[itemIndex].quantity = quantity;
        return updatedItems;
      }
      return prevItems;
    });

    // Save to Firestore in background
    try {
      await updateCartItemQuantityUtil(itemId, quantity, currentUser?.uid);
    } catch (error) {
      console.error('Error updating quantity in Firestore:', error);
      // Optionally revert on error, but for now just log
    }
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
