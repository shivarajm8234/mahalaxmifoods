import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductsGrid } from "@/components/ProductsGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { LocationMap } from "@/components/LocationMap";
import { CartItem, Product, Review } from "@/lib/types";
import MasalaChatBot from "@/components/MasalaChatBot";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";

const LOCAL_CART = "spicy-masala-cart";
const LOCAL_REVIEWS = "spicy-masala-reviews";

// Sample review data
const initialReviews: Review[] = [
  {
    id: "review-1",
    productId: "masala-1",
    userName: "Priya Sharma",
    rating: 5,
    comment: "Absolutely amazing! This garam masala transformed my cooking. The aroma is incredible and it tastes just like my grandmother's blend.",
    createdAt: "2024-06-10T10:30:00Z"
  },
  {
    id: "review-2",
    productId: "masala-1",
    userName: "Raj Patel",
    rating: 4,
    comment: "Great quality spices. Very authentic taste. Will definitely order again!",
    createdAt: "2024-06-08T15:45:00Z"
  },
  {
    id: "review-3",
    productId: "masala-2",
    userName: "Sarah Johnson",
    rating: 5,
    comment: "Perfect for tandoori dishes! The smoky flavor is exactly what I was looking for. Highly recommended.",
    createdAt: "2024-06-12T09:20:00Z"
  },
  {
    id: "review-4",
    productId: "masala-3",
    userName: "Amit Kumar",
    rating: 4,
    comment: "Love this on fruit salads! Adds such a unique and delicious flavor. Kids love it too.",
    createdAt: "2024-06-05T14:15:00Z"
  }
];

function useCart(setDrawer: (open: boolean) => void) {
  const [cart, setCart] = React.useState<CartItem[]>([]);

  React.useEffect(() => {
    const raw = localStorage.getItem(LOCAL_CART);
    if (raw) setCart(JSON.parse(raw));
  }, []);

  React.useEffect(() => {
    localStorage.setItem(LOCAL_CART, JSON.stringify(cart));
  }, [cart]);

  function addItem(product: Product, quantity: number = 1) {
    setCart((current) => {
      const idx = current.findIndex(i => i.product.id === product.id);
      if (idx < 0) return [...current, { product, quantity }];
      const cloned = [...current];
      cloned[idx].quantity += quantity;
      return cloned;
    });
    
    // Show toast notification
    const message = quantity === 1 
      ? `${product.title} added to cart!`
      : `${quantity}x ${product.title} added to cart!`;
    
    toast({
      title: "Added to Cart! 🛒",
      description: message,
      className: "bg-[#6FBF73] border-[#6FBF73] text-white cursor-pointer hover:bg-[#5A9F5E] transition-colors",
      duration: 3000,
      onClick: () => setDrawer(true),
    });
  }
  function updateQty(productId: string, qty: number) {
    setCart((current) =>
      current.map(item =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  }
  function remove(id: string) {
    setCart((current) => {
      const itemToRemove = current.find(item => item.product.id === id);
      const newCart = current.filter(item => item.product.id !== id);
      
      // Show toast notification
      if (itemToRemove) {
        toast({
          title: "Removed from Cart",
          description: `${itemToRemove.product.title} removed from cart`,
          className: "bg-[#D7263D] border-[#D7263D] text-white cursor-pointer hover:bg-[#B91C3A] transition-colors",
          duration: 3000,
          onClick: () => setDrawer(true),
        });
      }
      
      return newCart;
    });
  }
  function clear() {
    setCart([]);
    toast({
      title: "Order Placed! 🎉",
      description: "Thank you for your order. We'll process it soon!",
      className: "bg-[#FF6B35] border-[#FF6B35] text-white cursor-pointer hover:bg-[#E55A2B] transition-colors",
      duration: 3000,
      onClick: () => setDrawer(true),
    });
  }

  return { cart, addItem, updateQty, remove, clear };
}

function useReviews() {
  const [reviews, setReviews] = React.useState<Review[]>(initialReviews);

  React.useEffect(() => {
    const stored = localStorage.getItem(LOCAL_REVIEWS);
    if (stored) {
      try {
        const parsedReviews = JSON.parse(stored);
        setReviews(parsedReviews);
        console.log("Loaded reviews from localStorage:", parsedReviews);
      } catch (error) {
        console.error("Error parsing stored reviews:", error);
        setReviews(initialReviews);
      }
    } else {
      console.log("No stored reviews found, using initial reviews");
    }
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(LOCAL_REVIEWS, JSON.stringify(reviews));
      console.log("Saved reviews to localStorage:", reviews);
    } catch (error) {
      console.error("Error saving reviews to localStorage:", error);
    }
  }, [reviews]);

  const addReview = (productId: string, reviewData: { rating: number; comment: string; userName: string }) => {
    console.log("useReviews: Adding review for product", productId, reviewData);
    
    const newReview: Review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      ...reviewData,
      createdAt: new Date().toISOString()
    };
    
    setReviews(current => {
      const updated = [...current, newReview];
      console.log("Updated reviews:", updated);
      return updated;
    });
  };

  return { reviews, addReview };
}

const Index = () => {
  const [drawer, setDrawer] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const cartManager = useCart(setDrawer);
  const reviewManager = useReviews();
  const isMobile = useIsMobile();

  function handleShopNow() {
    window.scrollTo({ top: document.getElementById('products')?.offsetTop || 500, behavior: 'smooth' });
  }
  function handleCheckout() {
    setLoading(true);
    toast({
      title: "Processing Order...",
      description: "Please wait while we process your order",
      className: "bg-[#FF6B35] border-[#FF6B35] text-white cursor-pointer hover:bg-[#E55A2B] transition-colors",
      duration: 3000,
      onClick: () => setDrawer(true),
    });
    setTimeout(() => {
      setLoading(false);
      cartManager.clear();
      setDrawer(false);
      // Toast via CartDrawer/Button already handled
    }, 1200);
  }

  const handleCartClick = () => {
    setDrawer(!drawer); // Toggle the drawer state
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans antialiased flex flex-col pb-16 md:pb-0">
      <Navbar cartCount={cartManager.cart.reduce((s, i) => s + i.quantity, 0)} onCartClick={handleCartClick} />
      <main className="flex-1">
        <Hero onShop={handleShopNow} />
        <ProductsGrid 
          onAddToCart={cartManager.addItem} 
          reviews={reviewManager.reviews}
          onAddReview={reviewManager.addReview}
        />

        <AboutSection />
        <ContactSection />
      </main>
      <footer className="text-white pt-16 pb-8 px-4 md:px-8" style={{ background: 'linear-gradient(90deg, #1A2634 50%, #274472 100%)' }}>
        <div className="container-fluid mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          
          {/* Left: Company Info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-playfair font-bold text-[#FFA500] mb-2">Shree Mahalaxmi</h3>
            <div className="w-24 h-12 bg-white/10 rounded-lg mb-4 flex items-center justify-center text-xs text-white/50">
              LOGO
            </div>
            <p className="text-sm text-white/70">
              Authentic Indian spices, crafted with tradition and love. Taste the difference in every meal.
            </p>
            
            <p className="text-xs text-white/50 mt-auto pt-8">
              &copy; {new Date().getFullYear()} Shree Mahalaxmi Food Products. All Rights Reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm mb-6">
              <li><a href="#hero" className="hover:text-[#FFA500] transition-colors">Home</a></li>
              <li><a href="#products" className="hover:text-[#FFA500] transition-colors">Products</a></li>
              <li><a href="#about" className="hover:text-[#FFA500] transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-[#FFA500] transition-colors">Contact</a></li>
            </ul>
             <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Contact Us</h4>
            <div className="text-sm text-center text-white/70">
                <p>123 Spice Market Street,<br/>Bangalore, Karnataka 560001</p>
                <p className="mt-2">+91 98765 43210</p>
            </div>
          </div>

          {/* Middle: FSSAI Certification */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Certification</h4>
            <div className="bg-white/10 rounded-lg p-4 flex flex-col items-center gap-3">
              <img 
                src="/images/fssai.jpg" 
                alt="FSSAI Certified" 
                className="w-24 h-24 object-contain"
              />
              <div className="text-center">
                <p className="text-sm font-semibold text-white">FSSAI Certified</p>
                <p className="text-xs text-white/70">License No: 12345678901234</p>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Location</h4>
            <div className="w-full max-w-sm h-48 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <LocationMap />
            </div>
          </div>

        </div>
      </footer>
      <CartDrawer
        open={drawer}
        items={cartManager.cart}
        onUpdateQty={cartManager.updateQty}
        onRemove={cartManager.remove}
        onClose={() => setDrawer(!drawer)}
        onCheckout={handleCheckout}
        loading={loading}
      />
      {!(isMobile && (drawer || cartManager.cart.length > 0)) && <MasalaChatBot />}
    </div>
  );
};

export default Index;
