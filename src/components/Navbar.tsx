import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "Products", href: "#products" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" }
];

export function Navbar({ cartCount, onCartClick }: { cartCount: number; onCartClick: () => void; }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-[#F9F7F1] sticky top-0 z-50 shadow-lg rounded-b-2xl flex items-center justify-center px-4 md:px-8 py-2 border-b-4 border-[#FF6B35] font-sans relative">
      {/* Mobile Menu Button - Positioned absolutely on the left */}
      <div className="md:hidden absolute left-4">
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6 text-[#2F2F2F]" /> : <Menu className="h-6 w-6 text-[#2F2F2F]" />}
        </button>
      </div>

      {/* Logo - Positioned absolutely on the left for desktop */}
      <div className="hidden md:block absolute left-8">
        <div className="text-xl md:text-2xl font-playfair text-[#FF6B35] font-bold" style={{ letterSpacing: '0.02em' }}>
          <a href="#hero" className="hover:text-[#D7263D] transition-colors duration-150">Shree Mahalaxmi Food Products</a>
        </div>
      </div>

      {/* Mobile Logo - Centered */}
      <div className="md:hidden text-lg font-playfair text-[#FF6B35] font-bold" style={{ letterSpacing: '0.02em' }}>
        <a href="#hero" className="hover:text-[#D7263D] transition-colors duration-150">Shree Mahalaxmi Food Products</a>
      </div>
      
      {/* Desktop Navigation - Centered */}
      <ul className="hidden md:flex items-center gap-6 lg:gap-8 text-base lg:text-lg font-medium">
        {navLinks.map(link => (
          <li key={link.name}>
            <a href={link.href} className="hover:text-[#D7263D] transition-colors duration-150 text-[#2F2F2F]">{link.name}</a>
          </li>
        ))}
      </ul>

      {/* Cart Button - Positioned absolutely on the right */}
      <div className="absolute right-4">
        <button
          onClick={onCartClick}
          className="relative bg-[#D7263D] text-[#F9F7F1] px-3 md:px-4 py-2 rounded-full shadow-lg font-bold flex items-center hover:bg-[#FF6B35] transition-colors text-sm md:text-base"
        >
          <span className="hidden sm:inline">Cart</span>
          <span className="sm:hidden">🛒</span>
          <span className="ml-1 md:ml-2 rounded-full bg-[#6FBF73] text-white text-xs px-2 py-0.5 font-bold min-w-[20px] text-center">
            {cartCount}
          </span>
        </button>
      </div>

      {/* Mobile Navigation Menu (Collapsible) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#F9F7F1] shadow-lg rounded-b-2xl border-b-4 border-[#FF6B35] py-4">
          <ul className="flex flex-col items-center gap-4">
            {navLinks.map(link => (
              <li key={link.name}>
                <a href={link.href} className="text-lg font-medium text-[#2F2F2F] hover:text-[#D7263D] transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
