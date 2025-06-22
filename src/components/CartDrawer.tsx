import { CartItem, Product } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, useRef, useState } from "react";

export function CartDrawer({
  open,
  items,
  onUpdateQty,
  onRemove,
  onClose,
  onCheckout,
  loading = false,
}: {
  open: boolean;
  items: CartItem[];
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
  loading?: boolean;
}) {
  const [visible, setVisible] = React.useState(open);
  const prevItems = useRef<CartItem[]>(items);
  const [animateAddId, setAnimateAddId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setVisible(true);
    else setTimeout(() => setVisible(false), 350);
  }, [open]);

  // Animation when item is added
  useEffect(() => {
    if (items.length > prevItems.current.length) {
      // Find newly added product
      const added = items.find(
        item =>
          !prevItems.current.some(
            (old) => old.product.id === item.product.id && old.quantity === item.quantity
          )
      );
      if (added) {
        setAnimateAddId(added.product.id);
        setTimeout(() => setAnimateAddId(null), 800);
      }
    }
    prevItems.current = items;
  }, [items]);

  const total = items.reduce((s, item) => s + item.product.price * item.quantity, 0);

  const handleOpenCart = () => {
    onClose(); // This will toggle the cart open since onClose actually opens it
  };

  // Render floating mini-cart if drawer closed
  if (!open && items.length > 0)
    return (
      <div
        className="fixed bottom-16 md:bottom-4 left-0 right-0 z-50 w-full bg-[#FF6B35] border-2 border-[#FF6B35] rounded-none shadow-lg flex justify-between items-center px-3 md:px-4 py-2 animate-fade-in cursor-pointer hover:scale-105 transition duration-200 md:left-1/2 md:-translate-x-1/2 md:max-w-sm md:rounded-xl"
        onClick={handleOpenCart}
        aria-label="Open cart"
        tabIndex={0}
        role="button"
      >
        <span className="font-bold text-white text-sm md:text-base">
          {items.reduce((sum, i) => sum + i.quantity, 0)} item(s)
        </span>
        <span className="text-white font-playfair font-bold text-lg">
          ₹{total.toFixed(2)}
        </span>
        <svg className="ml-1" width="20" height="20" fill="none"><path d="M6 8l4 4 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    );

  // Draw main bottom cart
  return (
    <div
      className={`fixed left-0 right-0 bottom-0 top-0 md:top-auto md:bottom-0 z-50 bg-[#F9F7F1] shadow-2xl pt-2 pb-5 md:pb-5 transition-all duration-350 border-t-4 border-[#FF6B35] mx-0 md:mx-auto md:max-w-xl rounded-none md:rounded-t-xl h-screen md:h-auto
        ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
        ${items.length > 0 ? 'md:min-h-[210px]' : 'md:min-h-[130px]'}
      `}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex justify-between items-center px-4 md:px-6 pb-2">
        <span className="font-bold text-lg md:text-xl text-[#2F2F2F] font-playfair">Your Cart</span>
        <button onClick={onClose} className="text-[#D7263D] font-bold text-base md:text-lg px-3 py-1 hover:text-[#FF6B35] transition-colors duration-200">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {items.length === 0 ? (
          <div className="my-8 text-center text-base md:text-lg text-[#2F2F2F]">Your cart is empty.</div>
        ) : (
          items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-2 md:gap-3 bg-[#F9F7F1] rounded-lg p-2 border-2 border-[#FF6B35]/20 mx-2">
              <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
                <img src={product.image} alt={product.title}
                  className="object-cover rounded-md w-full h-full border bg-white"
                  onError={e => ((e.target) as HTMLImageElement).src='/placeholder.svg'}
                />
                {/* +1 animation */}
                {animateAddId === product.id && (
                  <span className="absolute -top-2 -left-2 md:-top-3 md:-left-3 bg-[#6FBF73] text-white font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs md:text-sm animate-bounce shadow">
                    +1
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-playfair font-bold text-sm md:text-base truncate text-[#2F2F2F]">{product.title}</div>
                <div className="text-xs text-[#2F2F2F] line-clamp-2">{product.description}</div>
                <div className="mt-1 flex items-center gap-1 md:gap-2">
                  <button
                    className="w-5 h-5 md:w-6 md:h-6 text-[#F9F7F1] bg-[#D7263D] rounded-l hover:bg-[#FF6B35] font-bold text-xs md:text-sm transition-colors duration-200 border border-[#D7263D]"
                    onClick={() => onUpdateQty(product.id, Math.max(1, quantity - 1))}
                  >-</button>
                  <span className="px-1 md:px-2 font-bold text-sm text-[#2F2F2F]">{quantity}</span>
                  <button
                    className="w-5 h-5 md:w-6 md:h-6 text-[#F9F7F1] bg-[#D7263D] rounded-r hover:bg-[#FF6B35] font-bold text-xs md:text-sm transition-colors duration-200 border border-[#D7263D]"
                    onClick={() => onUpdateQty(product.id, quantity + 1)}
                  >+</button>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-bold text-sm md:text-base text-[#FF6B35]">₹{(product.price * quantity).toFixed(2)}</div>
                <button
                  onClick={() => onRemove(product.id)}
                  className="text-xs text-[#D7263D] underline mt-1 md:mt-2 hover:text-[#FF6B35] transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="px-4 md:px-6 pt-4 md:static fixed bottom-0 left-0 w-full bg-[#F9F7F1] border-t border-[#FF6B35]/20 py-3 z-10">
          <div className="flex justify-between items-center">
            <div className="font-bold text-base md:text-lg text-[#2F2F2F]">Total:</div>
            <div className="font-bold text-xl md:text-2xl text-[#FF6B35]">₹{total.toFixed(2)}</div>
          </div>
          <button
            className="w-full bg-[#D7263D] text-[#F9F7F1] text-base md:text-lg py-3 rounded-full font-bold uppercase transition-colors duration-200 mt-2 border-2 border-[#D7263D] hover:bg-[#FF6B35]"
            onClick={() => { if (!loading) onCheckout(); }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}
