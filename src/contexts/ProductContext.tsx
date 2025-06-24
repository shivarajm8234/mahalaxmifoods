import { Product, Order } from "@/lib/types";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  addProduct: (product: Omit<Product, 'id' | 'status' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id' | 'status'>) => void;
  archiveProduct: (id: string) => void;
  restoreProduct: (id: string) => void;
  deleteProductPermanently: (id: string) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'order-1',
      user: { name: 'Rahul Sharma', email: 'rahul@example.com' },
      address: '123 Main Street, Mumbai, Maharashtra, 400001',
      items: [
        { productId: 'masala-1', title: 'Pure Turmeric Powder', quantity: 2, price: 11.99 },
        { productId: 'masala-3', title: 'banana powder', quantity: 1, price: 9.95 }
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  // On initial load, try to get products from localStorage.
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(LOCAL_PRODUCTS);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // If no products are stored, use the initial default list.
        setProducts(initialProducts);
      }
    } catch (error) {
      console.error("Error reading products from localStorage", error);
      // If there's an error, fall back to the default list.
      setProducts(initialProducts);
    }
  }, []);

  // Whenever the 'products' state changes, save it to localStorage.
  useEffect(() => {
    // We only save when the products array has been initialized.
    if (products.length > 0) {
      localStorage.setItem(LOCAL_PRODUCTS, JSON.stringify(products));
    }
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'status' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `masala-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const updateProduct = (id: string, productData: Omit<Product, 'id' | 'status'>) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, ...productData } : product
      )
    );
  };

  const archiveProduct = (id: string) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, status: 'archived' } : product
      )
    );
  };

  const restoreProduct = (id: string) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, status: 'active' } : product
      )
    );
  };

  const deleteProductPermanently = (id: string) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
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