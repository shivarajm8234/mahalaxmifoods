import React from "react";

export function Hero({ onShop }: { onShop: () => void }) {
  return (
    <section
      id="hero"
      className="relative w-full flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#F9F7F1] via-[#FF6B35]/5 to-[#F9F7F1] text-[#2F2F2F] overflow-hidden text-center mx-auto"
    >
      <div className="relative z-20 text-center max-w-4xl mx-auto px-4 flex flex-col items-center justify-center h-full -mt-20">
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl font-playfair font-bold mb-8 text-[#2F2F2F] mx-auto text-center"
          data-aos="fade-down"
          data-aos-delay="200"
        >
          Tradition in Every Taste
        </h1>
        <p 
          className="text-xl md:text-2xl mb-10 text-[#2F2F2F]/90 max-w-2xl mx-auto text-center"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          Experience the rich flavors of traditional Indian masalas, carefully crafted to elevate your culinary creations.
        </p>
        <button
          onClick={onShop}
          className="bg-[#FF6B35] text-[#F9F7F1] px-10 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:bg-[#D7263D] hover:scale-105 shadow-lg mx-auto block"
          data-aos="zoom-in"
          data-aos-delay="600"
        >
          Shop Now
        </button>
      </div>
    </section>
  );
}
