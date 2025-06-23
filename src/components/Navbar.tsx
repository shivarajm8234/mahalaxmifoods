import { useState } from "react";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { GoogleSignInButton } from "./auth/GoogleSignInButton";
import { UserDropdown } from "./auth/UserDropdown";

const navLinks = [
  { name: "Home", href: "#hero" },
  { name: "Products", href: "#products" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" }
];

interface NavbarProps {
  onCartClick: () => void;
}

export function Navbar({ onCartClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, loading } = useAuth();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  return (
    <nav className="w-full bg-[#F9F7F1] sticky top-0 z-50 shadow-lg rounded-b-2xl flex items-center justify-center px-4 md:px-8 py-2 border-b-4 border-[#FF6B35] font-sans relative">
      {/* Mobile Layout */}
      <div className="lg:hidden w-full flex items-center justify-between gap-x-4">
        {/* Mobile Menu Button */}
        <div className="pl-2">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-[#2F2F2F]" />
            ) : (
              <Menu className="h-6 w-6 text-[#2F2F2F]" />
            )}
          </button>
        </div>

        {/* Mobile Logo - Centered */}
        <div className="text-lg font-playfair text-[#FF6B35] font-bold px-2" style={{ letterSpacing: '0.02em' }}>
          <a href="#hero" className="hover:text-[#D7263D] transition-colors duration-150">
            Shree Mahalaxmi Food Products
          </a>
        </div>

        {/* Mobile Right Icons */}
        <div className="flex items-center gap-2 pr-2">
          {/* Cart Icon with Badge */}
          <button 
            onClick={onCartClick} 
            className="relative p-2 text-[#2F2F2F] hover:text-[#D7263D] transition-colors"
            aria-label="View cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D7263D] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>


          {/* User Dropdown or Sign In Button */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : currentUser ? (
            <UserDropdown user={currentUser} />
          ) : (
            <GoogleSignInButton />
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full items-center justify-between relative overflow-x-auto">
        {/* Logo - Positioned on the left for desktop */}
        <div>
          <div className="text-xl md:text-2xl font-playfair text-[#FF6B35] font-bold" style={{ letterSpacing: '0.02em' }}>
            <a href="#hero" className="hover:text-[#D7263D] transition-colors duration-150">
              Shree Mahalaxmi Food Products
            </a>
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

        {/* Desktop Right Side - Cart and User */}
        <div className="flex items-center gap-4">
          {/* Cart Icon with Badge */}
          <button
            onClick={onCartClick}
            className="relative p-2 text-[#2F2F2F] hover:text-[#D7263D] transition-colors"
            aria-label={`View cart (${cartCount} items)`}
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D7263D] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* User Dropdown or Sign In Button */}
          {loading ? (
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
          ) : currentUser ? (
            <UserDropdown user={currentUser} />
          ) : (
            <GoogleSignInButton />
          )}
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
