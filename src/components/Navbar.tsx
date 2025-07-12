import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  cartItemCount: number;
}

export function Navbar({ onCartClick, cartItemCount }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, loading } = useAuth();
  const { items: cartItems, getCartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
  };
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `
    w-full sticky top-0 z-50 shadow-lg flex items-center justify-center px-4 md:px-8 py-2 font-sans relative
    transition-all duration-300 ${isScrolled 
      ? 'bg-white/90 backdrop-blur-md border-b border-white/20' 
      : 'bg-transparent'}
    ${isMenuOpen ? 'rounded-b-2xl' : ''}
  `;

  return (
    <nav className={navClasses}>
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
          <Link 
            to="/" 
            className="hover:text-[#D7263D] transition-colors duration-150"
            onClick={handleLogoClick}
          >
            Shree Mahalaxmi Food Products
          </Link>
        </div>

        {/* Mobile Right Icons */}
        <div className="flex items-center gap-2 pr-2">
          {/* Cart Icon with Badge */}
          <button 
            onClick={onCartClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
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
      <div className="hidden lg:flex w-full max-w-7xl mx-auto px-6 items-center justify-between">
        {/* Brand Name - Left Side */}
        <Link 
          to="/"
          className={`text-xl font-playfair font-bold whitespace-nowrap ${
            isScrolled ? 'text-[#D7263D]' : 'text-white drop-shadow-md'
          } hover:text-[#D7263D] transition-colors duration-150`}
          onClick={handleLogoClick}
        >
          Shree Mahalaxmi
        </Link>
        
        {/* Navigation Links - Center */}
        <nav className="flex-1 flex justify-center">
          <ul className="flex items-center gap-8 xl:gap-10 text-base xl:text-lg font-medium">
            {navLinks.map(link => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className={`relative group hover:text-[#D7263D] transition-colors duration-200 ${
                    isScrolled ? 'text-[#2F2F2F]' : 'text-white drop-shadow-md'
                  }`}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D7263D] transition-all duration-200 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Right Side - Cart and User */}
        <div className="flex items-center gap-4 w-1/3 justify-end">
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
