import { Product, Order } from "@/lib/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  deleteField
} from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";

const LOCAL_PRODUCTS = "spicy-masala-products";

// Remove initialProducts fallback. Only use Firestore data.
// const initialProducts: Product[] = [ ... ]; // <-- REMOVE or comment out this block

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  updateProduct: (id: string, product: Omit<Product, 'id' | 'status'>) => void;
  archiveProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  deleteProductPermanently: (id: string) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
  realtime?: boolean;
}

export function ProductProvider({ children, realtime = false }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'order-1',
      userId: 'user-1',
      items: [
        { productId: 'masala-1', name: 'Pure Turmeric Powder', quantity: 2, price: 11.99 },
        { productId: 'masala-3', name: 'banana powder', quantity: 1, price: 9.95 }
      ],
      total: 33.93,
      status: 'pending',
      shippingAddress: {
        name: 'Rahul Sharma',
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        country: 'India',
        phone: '9999999999',
        email: 'rahul@example.com'
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { name: 'Rahul Sharma', email: 'rahul@example.com' }
    }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    if (realtime) {
      // Real-time updates for admin panel
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      try {
        const unsub = onSnapshot(q, (snapshot) => {
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
          setLoading(false);
        }, (error) => {
          console.error('Error fetching products (realtime):', error);
          toast({
            title: "Error",
            description: "Failed to fetch products. Please refresh or check your connection.",
            variant: "destructive",
          });
          setLoading(false);
        });
        return () => unsub();
      } catch (error) {
        console.error('Error setting up realtime product listener:', error);
        toast({
          title: "Error",
          description: "Failed to set up product listener.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } else {
      // One-time fetch for main website
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        } catch (error) {
          console.error('Error fetching products:', error);
          toast({
            title: "Error",
            description: "Failed to fetch products. Please refresh or check your connection.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [realtime]);

  const addProduct = async (productData: Omit<Product, 'id' | 'status' | 'createdAt'>) => {
    try {
      const { title, description, price, image, gst, shippingFee, ...rest } = productData;

      // Validate required fields
      if (!title?.trim() || !description?.trim() || typeof price !== 'number' || !image?.trim()) {
        throw new Error("Please fill in all required product fields.");
      }

      // Create product data object with only defined and non-empty fields
      const productDataToSave: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        price,
        image: image.trim(),
        status: "active",
        createdAt: new Date().toISOString(),
      };

      // Handle GST and shipping fee fields
      if (typeof gst === 'number') {
        productDataToSave.gst = gst;
      }
      if (typeof shippingFee === 'number') {
        productDataToSave.shippingFee = shippingFee;
      }

      // Handle optional fields
      if (rest.badge?.trim()) {
        productDataToSave.badge = rest.badge.trim();
      }

      // Add the document to Firestore
      await addDoc(collection(db, "products"), productDataToSave);

      toast({
        title: "Product Added",
        description: `${title} was added successfully.`,
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error('Error adding product to Firestore:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProduct = async (id: string, productData: Omit<Product, 'id' | 'status'>) => {
    const updateData: any = { ...productData };

    // If badge is an empty string, remove it from the update data
    if ('badge' in updateData && !updateData.badge) {
      delete updateData.badge;
      await updateDoc(doc(db, "products", id), {
        ...updateData,
        badge: deleteField()
      });
    } else {
      // Handle GST and shipping fee fields - ensure they are numbers or remove them
      if ('gst' in updateData && typeof updateData.gst !== 'number') {
        delete updateData.gst;
      }
      if ('shippingFee' in updateData && typeof updateData.shippingFee !== 'number') {
        delete updateData.shippingFee;
      }
      
      await updateDoc(doc(db, "products", id), updateData);
    }
  };

  const archiveProduct = async (id: string) => {
    await updateDoc(doc(db, "products", id), { status: "archived" });
  };

  const restoreProduct = async (id: string) => {
    await updateDoc(doc(db, "products", id), { status: "active" });
  };

  const deleteProductPermanently = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, archiveProduct, restoreProduct, deleteProductPermanently, orders, addOrder }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

export function useOrders() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within a ProductProvider');
  }
  return { orders: context.orders, addOrder: context.addOrder };
} 