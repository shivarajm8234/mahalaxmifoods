import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

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
      {/* Mobile Layout */}
      <div className="lg:hidden w-full flex items-center justify-between gap-x-4">
        {/* Mobile Menu Button */}
        <div className="pl-2">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6 text-[#2F2F2F]" /> : <Menu className="h-6 w-6 text-[#2F2F2F]" />}
          </button>
        </div>

        {/* Mobile Logo - Centered */}
        <div className="text-lg font-playfair text-[#FF6B35] font-bold px-2" style={{ letterSpacing: '0.02em' }}>
          <a href="#hero" className="hover:text-[#D7263D] transition-colors duration-150">Shree Mahalaxmi Food Products</a>
        </div>

        {/* Mobile Login Button */}
        <div className="pr-2">
          <button
            className="bg-[#D7263D] text-[#F9F7F1] p-2 rounded-full shadow-lg flex items-center hover:bg-[#FF6B35] transition-colors"
            aria-label="Login"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full items-center justify-between relative overflow-x-auto">
        {/* Logo - Positioned on the left for desktop */}
        <div>
          <div className="text-xl md:text-2xl font-playfair text-[#FF6B35] font-bold" style={{ letterSpacing: '0.02em' }}>
            <a href="#hero" className="hover:text-[#D7263D] transition-colors duration-150">Shree Mahalaxmi Food Products</a>
          </div>
        </div>
        
        {/* Desktop Navigation - Absolutely Centered */}
        <ul className="flex items-center gap-6 xl:gap-8 text-base xl:text-lg font-medium absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map(link => (
            <li key={link.name}>
              <a href={link.href} className="hover:text-[#D7263D] transition-colors duration-150 text-[#2F2F2F]">{link.name}</a>
            </li>
          ))}
        </ul>

        {/* Desktop Login Button */}
        <div>
          <button
            className="bg-[#D7263D] text-[#F9F7F1] px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 hover:bg-[#FF6B35] transition-colors text-base"
          >
            <User className="h-5 w-5" />
            <span>Login</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu (Collapsible) */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#F9F7F1] shadow-lg rounded-b-2xl border-b-4 border-[#FF6B35] py-4">
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
