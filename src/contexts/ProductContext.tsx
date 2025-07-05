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

// This is the default list of products if none are found in storage.
const initialProducts: Product[] = [
  {
    id: "masala-1",
    title: "Pure Turmeric Powder",
    description: "A bold blend of roasted spices—coriander, cumin, cardamom—perfect for any meal.",
    price: 11.99,
    image: "/images/mahalaxmi-products.jpg",
    badge: "bestseller",
    status: 'active',
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "masala-2",
    title: "onion powder",
    description: "Smoky paprika, garlic, ginger; adds instant heat and depth to grilled dishes.",
    price: 13.49,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80",
    badge: "NEW",
    status: 'active',
    createdAt: "2024-02-15T12:00:00Z",
  },
  {
    id: "masala-3",
    title: "banana powder",
    description: "Sweet-tart, tangy, and aromatic masala for fruit, salads, or street-snack magic.",
    price: 9.95,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80",
    status: 'active',
    createdAt: "2024-03-20T15:00:00Z",
  },
  {
    id: "masala-4",
    title: "apple powder",
    description: "Aromatic, creamy, expertly balanced for restaurant-style curries at home.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
    status: 'active',
    createdAt: "2024-04-05T09:00:00Z",
  },
  {
    id: "masala-5",
    title: "tomato powder",
    description: "The perfect gift: try all five masalas in tasting tins. Limited time only!",
    price: 44.00,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
    status: 'active',
    createdAt: "2024-05-12T11:00:00Z",
  },
];

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
      const { title, description, price, image, ...rest } = productData;
      
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