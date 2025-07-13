import { doc, getDoc, setDoc, serverTimestamp, collection, arrayUnion, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  category?: string;
  gst?: number;
  shippingFee?: number;
}

const CART_STORAGE_KEY = 'cart';

// Debounce mechanism for Firestore updates
let firestoreUpdateTimeout: NodeJS.Timeout | null = null;
let pendingCartUpdate: CartItem[] | null = null;
let pendingUserId: string | null = null;

// Get cart from localStorage
export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
};

// Save cart to localStorage
const saveCartToLocal = (cart: CartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

// Get user's cart from Firestore
const getUserCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.data()?.cart || [];
  } catch (error: any) {
    // Handle permission errors gracefully
    if (error.code === 'permission-denied' || error.code === 'missing-permissions') {
      console.warn('Permission denied for user cart. User may not be authenticated or rules may need updating.');
      return [];
    }
    console.error('Error getting user cart:', error);
    return [];
  }
};

// Save cart to Firestore with debouncing
const saveCartToFirestore = async (cart: CartItem[], userId: string) => {
  // Clear existing timeout
  if (firestoreUpdateTimeout) {
    clearTimeout(firestoreUpdateTimeout);
  }

  // Store pending update
  pendingCartUpdate = cart;
  pendingUserId = userId;

  // Set new timeout for debounced update
  firestoreUpdateTimeout = setTimeout(async () => {
    if (pendingCartUpdate && pendingUserId) {
      try {
        const userRef = doc(db, 'users', pendingUserId);
        await setDoc(
          userRef,
          { cart: pendingCartUpdate, updatedAt: serverTimestamp() },
          { merge: true }
        );
        console.log('Cart saved to Firestore successfully');
      } catch (error: any) {
        // Handle permission errors gracefully
        if (error.code === 'permission-denied' || error.code === 'missing-permissions') {
          console.warn('Permission denied for saving cart. User may not be authenticated or rules may need updating.');
          return; // Don't throw error, just return silently
        }
        console.error('Error saving cart to Firestore:', error);
      } finally {
        // Clear pending update
        pendingCartUpdate = null;
        pendingUserId = null;
      }
    }
  }, 500); // 500ms debounce delay
};

// Helper to fetch all products as a map by id
async function fetchProductsMap() {
  const snapshot = await getDocs(collection(db, 'products'));
  const map = {};
  snapshot.forEach(doc => {
    map[doc.id] = doc.data();
  });
  return map;
}

// Sync cart between localStorage and Firestore
export const syncCart = async (userId: string): Promise<CartItem[]> => {
  try {
    const localCart = getCart();
    const serverCart = await getUserCart(userId);
    
    // If server cart is empty and local cart has items, this might be a new user
    // or a user switching accounts. Clear the local cart to start fresh.
    if (serverCart.length === 0 && localCart.length > 0) {
      console.log('New user detected or account switch. Clearing local cart.');
      saveCartToLocal([]);
      return [];
    }
    
    // Merge carts - prioritize server cart for items that exist in both
    const mergedCart = [...localCart];
    serverCart.forEach(serverItem => {
      const existingItemIndex = mergedCart.findIndex(item => item.id === serverItem.id);
      if (existingItemIndex === -1) {
        mergedCart.push(serverItem);
      }
    });

    // --- PATCH: Ensure gst and shippingFee are present ---
    const productsMap = await fetchProductsMap();
    console.log('🔍 Cart sync - Products map:', productsMap);
    console.log('🔍 Cart sync - Before patch, merged cart:', mergedCart);
    
    for (const item of mergedCart) {
      const product = productsMap[item.id];
      console.log(`🔍 Processing item ${item.id} (${item.name}):`, {
        itemGst: item.gst,
        itemShippingFee: item.shippingFee,
        productGst: product?.gst,
        productShippingFee: product?.shippingFee
      });
      
      if (product) {
        if (typeof item.gst === 'undefined') {
          item.gst = product.gst || 0;
          console.log(`✅ Updated GST for ${item.name}: ${item.gst}`);
        }
        if (typeof item.shippingFee === 'undefined') {
          item.shippingFee = product.shippingFee || 0;
          console.log(`✅ Updated shipping fee for ${item.name}: ${item.shippingFee}`);
        }
      } else {
        console.warn(`⚠️ Product not found for item ${item.id} (${item.name})`);
      }
    }
    
    console.log('🔍 Cart sync - After patch, merged cart:', mergedCart);
    // --- END PATCH ---
    
    // Save merged cart to both local and server
    saveCartToLocal(mergedCart);
    await saveCartToFirestore(mergedCart, userId);
    
    return mergedCart;
  } catch (error: any) {
    // Handle permission errors gracefully
    if (error.code === 'permission-denied' || error.code === 'missing-permissions') {
      console.warn('Permission denied for cart sync. Using local cart only.');
      return getCart(); // Fallback to local cart
    }
    console.error('Error syncing cart:', error);
    return getCart(); // Fallback to local cart
  }
};

export const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }, userId?: string): Promise<CartItem[]> => {
  console.log('🔍 addToCart - Adding item:', item);
  const quantity = item.quantity || 1;
  const cart = getCart();
  const existingItemIndex = cart.findIndex(i => i.id === item.id);

  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity += quantity;
    console.log('🔍 addToCart - Updated existing item quantity:', cart[existingItemIndex]);
  } else {
    cart.push({ ...item, quantity });
    console.log('🔍 addToCart - Added new item:', cart[cart.length - 1]);
  }

  // Save to local storage immediately
  saveCartToLocal(cart);

  // Save to Firestore in background (don't await)
  if (userId) {
    saveCartToFirestore(cart, userId).catch((error: any) => {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied' || error.code === 'missing-permissions') {
        console.warn('Permission denied for updating cart in Firestore. Using local storage only.');
        return;
      }
      console.error('Error updating cart in Firestore:', error);
    });
  }

  return [...cart];
};

export const removeFromCart = async (itemId: string, userId?: string): Promise<CartItem[]> => {
  const cart = getCart().filter(item => item.id !== itemId);
  
  // Save to local storage immediately
  saveCartToLocal(cart);

  // Save to Firestore in background (don't await)
  if (userId) {
    saveCartToFirestore(cart, userId).catch((error: any) => {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied' || error.code === 'missing-permissions') {
        console.warn('Permission denied for updating cart in Firestore. Using local storage only.');
        return;
      }
      console.error('Error updating cart in Firestore:', error);
    });
  }

  return cart;
};

export const updateCartItemQuantity = async (itemId: string, quantity: number, userId?: string): Promise<CartItem[]> => {
  if (quantity < 1) {
    return removeFromCart(itemId, userId);
  }

  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  
  if (item) {
    item.quantity = quantity;
    
    // Save to local storage immediately
    saveCartToLocal(cart);

    // Save to Firestore in background (don't await)
    if (userId) {
      saveCartToFirestore(cart, userId).catch((error: any) => {
        // Handle permission errors gracefully
        if (error.code === 'permission-denied' || error.code === 'missing-permissions') {
          console.warn('Permission denied for updating cart in Firestore. Using local storage only.');
          return;
        }
        console.error('Error updating cart in Firestore:', error);
      });
    }
  }

  return [...cart];
};

export const clearCart = async (userId?: string): Promise<void> => {
  saveCartToLocal([]);
  
  if (userId) {
    try {
      await saveCartToFirestore([], userId);
    } catch (error: any) {
      // Handle permission errors gracefully
      if (error.code === 'permission-denied' || error.code === 'missing-permissions') {
        console.warn('Permission denied for clearing cart in Firestore. Using local storage only.');
        return;
      }
      console.error('Error clearing cart in Firestore:', error);
    }
  }
};

// Clear cart for new users or when switching accounts
export const clearCartForNewUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('Cart cleared for new user');
  }
};

export const checkout = async (cart: CartItem[], userId: string, userData: {
  name?: string;
  email?: string;
  phone?: string;
  // Accept address fields individually
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  paymentMethod?: 'online' | 'cod';
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}): Promise<CheckoutResult> => {
  try {
    if (!cart.length) {
      throw new Error('Cart is empty');
    }

    const orderRef = doc(collection(db, 'orders'));
    const orderId = orderRef.id;
    const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Build shipping address object
    const shippingAddress = {
      name: userData.name || '',
      street: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      zip: userData.zip || '',
      country: userData.country || ''
    };

    // Create order data
    const orderData: any = {
      id: orderId,
      userId,
      items: cart,
      total: orderTotal,
      status: 'pending',
      customerInfo: {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
      },
      shippingAddress, // always an object
      paymentMethod: userData.paymentMethod || 'online',
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Attach Razorpay payment details if present
    if (userData.razorpay_payment_id) {
      orderData.razorpay_payment_id = userData.razorpay_payment_id;
      orderData.razorpay_order_id = userData.razorpay_order_id;
      orderData.razorpay_signature = userData.razorpay_signature;
      orderData.paymentStatus = 'paid';
      orderData.status = 'confirmed';
    }

    // Save order to Firestore
    await setDoc(orderRef, orderData);
    console.log('Order created in Firestore:', orderId);

    if (userData.paymentMethod === 'online') {
      if (!userData.razorpay_payment_id) {
        // For online payments, but payment not yet done
        await updateDoc(orderRef, {
          status: 'payment_pending',
          paymentStatus: 'pending',
          updatedAt: serverTimestamp(),
        });
        // Return success - frontend will handle the redirect to Razorpay
        return {
          success: true,
          orderId,
        };
      } else {
        // Payment done, update user's orders array
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          orders: arrayUnion(orderId),
          updatedAt: serverTimestamp(),
        });
        // Clear cart
        await saveCartToFirestore([], userId);
        saveCartToLocal([]);
        return {
          success: true,
          orderId,
        };
      }
    } else {
      // For cash on delivery
      await updateDoc(orderRef, {
        status: 'confirmed',
        paymentStatus: 'pending',
        updatedAt: serverTimestamp(),
      });
      // Update user's orders array
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        orders: arrayUnion(orderId),
        updatedAt: serverTimestamp(),
      });
      // Clear cart
      await saveCartToFirestore([], userId);
      saveCartToLocal([]);
      console.log('Cash on delivery order completed');
    }
    
    return { 
      success: true, 
      orderId 
    };
  } catch (error) {
    console.error('Error during checkout:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred during checkout' 
    };
  }
};
