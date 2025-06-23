import { Product } from "@/lib/types";
import React from "react";

export function ProductCard({
  product,
  onAddToCart,
  onViewProduct,
}: {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewProduct: (product: Product) => void;
}) {
  // Ensure placeholder loads if product image fails
  const [imgSrc, setImgSrc] = React.useState(product.image);

  return (
    <div 
      className="bg-[#F9F7F1] rounded-3xl border-2 border-[#FF6B35]/20 flex flex-col transition-all duration-300 hover:scale-105 group relative overflow-hidden cursor-pointer"
      onClick={() => onViewProduct(product)}
    >
      <div className="relative overflow-hidden">
        <img
          src={imgSrc}
          alt={`Masala product: ${product.title}`}
          className="h-56 w-full object-cover bg-[#F9F7F1] transition-transform duration-300 group-hover:scale-110"
          onError={() => setImgSrc("/placeholder.svg")}
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#6FBF73] text-white text-xs font-semibold px-3 py-1 rounded-full z-10 uppercase tracking-widest transition-transform duration-300 group-hover:scale-110">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2 p-5">
        <h3 className="font-playfair text-xl font-bold mb-1 group-hover:text-[#FF6B35] text-[#2F2F2F] transition-colors duration-300">
          {product.title}
        </h3>
        <p className="text-sm text-[#2F2F2F] mb-2 leading-tight transition-opacity duration-300 group-hover:opacity-80">{product.description}</p>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-lg font-bold text-[#FF6B35] transition-transform duration-300 group-hover:scale-110">₹{product.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="px-4 py-1 rounded-full bg-[#D7263D] text-[#F9F7F1] font-bold transition-all duration-300 hover:bg-[#FF6B35] hover:scale-110 border-2 border-[#D7263D] hover:border-[#FF6B35]"
            aria-label={`Add ${product.title} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
