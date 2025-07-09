import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductsGrid } from "@/components/ProductsGrid";
import { CartDrawer } from "@/components/CartDrawer";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { CartItem as LibCartItem, Product } from "@/lib/types";
import { CartItem as UtilsCartItem } from "@/utils/cartUtils";
import { productToCartItem, toLibCartItem } from "@/utils/typeConverters";
import MasalaChatBot from "@/components/MasalaChatBot";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useReviews } from "@/contexts/ReviewContext";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser } = useAuth();
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

  const handleAddReview = (review: { productId: string; rating: number; comment: string; userName: string; userId: string }) => {
    if (!currentUser) {
      alert("You must be logged in to submit a review.");
      return;
    }
    addReview({ ...review, userId: currentUser.uid });
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
          onAddReview={handleAddReview}
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
