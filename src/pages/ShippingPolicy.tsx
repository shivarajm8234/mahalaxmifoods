import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';

export default function ShippingPolicy() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { 
    items: cartItems, 
    getCartCount, 
    addToCart, 
    updateCartItemQuantity, 
    removeFromCart, 
    checkout 
  } = useCart();
  const cartItemCount = getCartCount();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        onCartClick={() => setDrawerOpen(true)} 
        cartItemCount={cartItemCount} 
      />
      <CartDrawer
        open={drawerOpen}
        items={cartItems}
        onUpdateQty={(id, quantity) => updateCartItemQuantity(id, quantity)}
        onRemove={removeFromCart}
        onClose={() => setDrawerOpen(false)}
        onCheckout={async (userData) => {
          try {
            setIsCheckingOut(true);
            const result = await checkout();
            if (result.success) {
              toast({
                title: 'Order Placed!',
                description: 'Your order has been placed successfully.',
              });
              setDrawerOpen(false);
              return { success: true };
            } else {
              throw new Error(result.error || 'Failed to place order');
            }
          } catch (error: any) {
            console.error('Checkout error:', error);
            toast({
              title: 'Checkout Failed',
              description: error.message || 'There was an error processing your order.',
              variant: 'destructive',
            });
            return { success: false, error: error.message };
          } finally {
            setIsCheckingOut(false);
          }
        }}
        loading={isCheckingOut}
      />
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shipping & Delivery Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Processing Time</h2>
            <p className="mb-4">
              All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Delivery Time</h2>
            <p className="mb-2">Standard delivery time is 5-7 business days after processing.</p>
            <p className="mb-4">Delivery times may vary depending on your location and any unforeseen circumstances.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Shipping Rates</h2>
            <p className="mb-2">We offer free shipping on all orders above ₹500.</p>
            <p className="mb-4">For orders below ₹500, a flat shipping fee of ₹50 will be applied.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Order Tracking</h2>
            <p className="mb-4">
              Once your order is shipped, you will receive a tracking number via email. You can use this number to track your order on our website or the courier's website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Shipping Areas</h2>
            <p className="mb-4">
              We currently ship to all major cities and towns across India. For remote locations, additional delivery time may be required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Delivery Issues</h2>
            <p className="mb-2">If you encounter any issues with your delivery, please contact our customer support team immediately.</p>
            <p className="mb-4">Please ensure that the shipping address provided is accurate to avoid any delivery delays.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Contact Us</h2>
            <p className="mb-4">
              For any questions or concerns regarding shipping and delivery, please contact us at <a href="mailto:info@mahalaxmifoods.in" className="text-blue-600 hover:underline">info@mahalaxmifoods.in</a> or call us at <a href="tel:+918050625634" className="text-blue-600 hover:underline">+91 8050625634</a>.
            </p>
          </section>

          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
