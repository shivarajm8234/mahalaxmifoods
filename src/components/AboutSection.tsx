export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[#F0F8FF]">
      <div className="max-w-4xl mx-auto flex flex-col items-center px-5">
        <h2 
          className="text-4xl font-playfair font-bold text-gray-800 mb-6 text-center"
          data-aos="fade-down"
        >
          About <span className="text-[#D7263D]">Us</span>
        </h2>
        <p 
          className="text-lg mb-6 text-center max-w-2xl text-gray-800"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Spicy Masala is on a mission to bring India's legendary spice magic to modern kitchens. Our founder, inspired by a century-old family recipe, started blending small batches in their NYC apartment in 2021. From classic garam masala to bold contemporary twists, every blend is freshly ground, ethically sourced, and shipped with care. We believe in joyful, flavorful, no-shortcut cooking—now just a click away.
        </p>
        <div 
          className="flex flex-row justify-center space-x-5 mt-4"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <span className="bg-[#FFA500] text-white px-5 py-2 rounded-full font-bold text-md animate-scale-in hover:bg-[#B2F2BB] hover:text-gray-800 transition-colors duration-200 border-2 border-[#FFA500]">Vegan</span>
          <span className="bg-[#FFA500] text-white px-5 py-2 rounded-full font-bold text-md animate-scale-in hover:bg-[#B2F2BB] hover:text-gray-800 transition-colors duration-200 border-2 border-[#FFA500]">No Additives</span>
          <span className="bg-[#FFA500] text-white px-5 py-2 rounded-full font-bold text-md animate-scale-in hover:bg-[#B2F2BB] hover:text-gray-800 transition-colors duration-200 border-2 border-[#FFA500]">100% Fresh</span>
        </div>
      </div>
    </section>
  );
}
