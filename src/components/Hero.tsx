import React, { useRef, useEffect } from "react";

export function Hero({ onShop }: { onShop: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => console.log("Autoplay prevented:", err));
    }
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/spices-bg.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Tradition in Every Taste
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl">
          Experience the rich flavors of traditional Indian masalas, carefully crafted to elevate your culinary creations.
        </p>
        <button
          onClick={onShop}
          className="bg-[#FF6B35] hover:bg-[#D7263D] text-white px-8 py-3 rounded-full font-bold transition-colors"
        >
          Shop Now
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 border-4 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white mt-2 rounded-full" />
        </div>
      </div>
    </section>
  );
}
