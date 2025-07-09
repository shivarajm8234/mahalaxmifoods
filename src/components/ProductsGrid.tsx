import { Product, Review } from "@/lib/types";
import { useProducts } from "@/contexts/ProductContext";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductsGridProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  reviews: Review[];
  onAddReview: (review: { productId: string; rating: number; comment: string; userName: string; userId: string }) => void;
}

export function ProductsGrid({ onAddToCart, reviews, onAddReview }: ProductsGridProps) {
  const { products } = useProducts();
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [isAtEnd, setIsAtEnd] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddReview = (reviewData: { rating: number; comment: string; userName: string; userId: string }) => {
    if (selectedProduct) {
      onAddReview({
        productId: selectedProduct.id,
        ...reviewData
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // w-72 is 18rem (288px), gap-4 is 1rem (16px). Total scroll = 304px.
      const scrollAmount = 304;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 304;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setIsAtEnd(scrollLeft >= scrollWidth - clientWidth - 5);
    }
  };

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      handleScroll(); // Initial check
      scrollContainer.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);

      // Always show the first product on mount
      scrollContainer.scrollLeft = 0;

      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, []);

  return (
    <>
      <section id="products" className="w-full bg-[#F0F8FF] py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 
            className="text-3xl md:text-4xl font-playfair font-bold text-[#FFA500] text-center mb-8 md:mb-10 border-none no-underline"
            data-aos="fade-down"
          >
            Our Masala Collection
          </h2>
          
          {/* Mobile: Horizontal Scroll with Arrows */}
          <div className="md:hidden relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white text-[#FF6B35] rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              style={{ display: scrollPosition > 5 ? 'flex' : 'none' }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white text-[#FF6B35] rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              style={{ display: isAtEnd ? 'none' : 'flex' }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Horizontal Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex w-full gap-4 overflow-x-auto scrollbar-hide py-4 px-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="flex-shrink-0 w-72 snap-center"
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={product.status === 'archived' ? undefined : onAddToCart}
                    onViewProduct={handleViewProduct}
                  />
                  {product.status === 'archived' && (
                    <div className="absolute top-4 right-4 bg-gray-700 text-white text-xs px-3 py-1 rounded-full z-20">Out of Stock</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="relative"
              >
                <ProductCard 
                  product={product} 
                  onAddToCart={product.status === 'archived' ? undefined : onAddToCart}
                  onViewProduct={handleViewProduct}
                />
                {product.status === 'archived' && (
                  <div className="absolute top-4 right-4 bg-gray-700 text-white text-xs px-3 py-1 rounded-full z-20">Out of Stock</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleCloseModal}
        onAddToCart={selectedProduct?.status === 'archived' ? undefined : onAddToCart}
        reviews={reviews}
        onAddReview={handleAddReview}
      />
    </>
  );
}
