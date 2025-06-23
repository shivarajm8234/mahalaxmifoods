import { Product, Review } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const products: Product[] = [
  {
    id: "masala-1",
    title: "Pure Turmeric Powder",
    description: "A bold blend of roasted spices—coriander, cumin, cardamom—perfect for any meal.",
    price: 11.99,
    image: "/images/mahalaxmi-products.jpg",
    badge: "bestseller",
  },
  {
    id: "masala-2",
    title: " onion powder",
    description: "Smoky paprika, garlic, ginger; adds instant heat and depth to grilled dishes.",
    price: 13.49,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80",
    badge: "NEW",
  },
  {
    id: "masala-3",
    title: "banana powder",
    description: "Sweet-tart, tangy, and aromatic masala for fruit, salads, or street-snack magic.",
    price: 9.95,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "masala-4",
    title: "apple powder",
    description: "Aromatic, creamy, expertly balanced for restaurant-style curries at home.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "masala-5",
    title: "tomato powder",
    description: "The perfect gift: try all five masalas in tasting tins. Limited time only!",
    price: 44.00,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80",
    badge: "Popular",
  },
];

interface ProductsGridProps {
  onAddToCart: (product: Product, quantity?: number) => void;
  reviews: Review[];
  onAddReview: (productId: string, review: { rating: number; comment: string; userName: string }) => void;
}

export function ProductsGrid({ onAddToCart, reviews, onAddReview }: ProductsGridProps) {
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

  const handleAddReview = (reviewData: { rating: number; comment: string; userName: string }) => {
    console.log("ProductsGrid: Handling review for product", selectedProduct?.id, reviewData);
    if (selectedProduct) {
      onAddReview(selectedProduct.id, reviewData);
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
                    onAddToCart={onAddToCart}
                    onViewProduct={handleViewProduct}
                  />
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
              >
                <ProductCard 
                  product={product} 
                onAddToCart={onAddToCart}
                onViewProduct={handleViewProduct}
              />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductModal
        product={selectedProduct}
        open={modalOpen}
        onClose={handleCloseModal}
        onAddToCart={onAddToCart}
        reviews={reviews}
        onAddReview={handleAddReview}
      />
    </>
  );
}
