import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductsGrid } from "@/components/ProductsGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { CartItem as LibCartItem, Product, Review } from "@/lib/types";
import { CartItem as UtilsCartItem } from "@/utils/cartUtils";
import { productToCartItem, toLibCartItem } from "@/utils/typeConverters";
import MasalaChatBot from "@/components/MasalaChatBot";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

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

// Helper function to get the display name of a product
const getProductName = (product: Product | string) => 
  typeof product === 'string' ? product : product.title;

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
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const { 
    items: cart, 
    addToCart, 
    updateCartItemQuantity, 
    removeFromCart, 
    checkout,
    getCartCount 
  } = useCart();
  const { reviews, addReview } = useReviews();
  const isMobile = useIsMobile();
  
  // Calculate total items in cart
  const cartItemCount = getCartCount();

  const handleShopNow = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const cartItem = productToCartItem(product, quantity);
    addToCart(cartItem);
    toast({
      title: "Added to Cart! 🛒",
      description: `${product.title} has been added to your cart.`,
      className: "bg-green-500 text-white",
      duration: 3000,
    });
    setDrawerOpen(true);
  };

  const handleCheckout = async (userData: any) => {
    try {
      const result = await checkout({
        ...userData,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      });

      if (result.success) {
        toast({
          title: "Order Placed! 🎉",
          description: "Thank you for your order. We'll process it soon!",
          className: "bg-green-500 text-white"
        });
        return { success: true };
      } else {
        throw new Error(result.error || "Failed to process order");
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "An error occurred during checkout",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleCartClick = () => {
    setDrawerOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans antialiased flex flex-col">
      <Navbar 
        onCartClick={handleCartClick} 
        cartItemCount={cartItemCount}
      />
      
      <main className="flex-1">
        <Hero onShop={handleShopNow} />
        <ProductsGrid 
          onAddToCart={handleAddToCart} 
          reviews={reviews}
          onAddReview={addReview}
        />
        <AboutSection />
        <ContactSection />
      </main>

      <CartDrawer
        open={drawerOpen}
        items={cart.map(utilsItem => {
          // Create a minimal product object to satisfy the LibCartItem type
          const product: Product = {
            id: utilsItem.id,
            title: utilsItem.name,
            description: utilsItem.description || '',
            price: utilsItem.price,
            image: utilsItem.image || '',
          };
          return {
            product,
            quantity: utilsItem.quantity
          };
        })}
        onUpdateQty={updateCartItemQuantity}
        onRemove={removeFromCart}
        onClose={() => setDrawerOpen(false)}
        onCheckout={handleCheckout}
        loading={false}
      />
      {!(isMobile && (drawerOpen || cart.length > 0)) && <MasalaChatBot />}
    </div>
  );
};

export default Index;
