import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LocationMap } from './LocationMap';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <>
      <footer className="w-full text-white pt-16 pb-8 px-4 md:px-8" style={{ background: 'linear-gradient(90deg, #1A2634 50%, #274472 100%)' }}>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Left: Company Info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-playfair font-bold text-[#FFA500] mb-2">Shree Mahalaxmi Food Products</h3>
            <Link to="/" className="mt-2">
              <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src="/logo.jpg" 
                  alt="Shree Mahalaxmi Food Products" 
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
            <p className="text-sm text-white/70 mt-4">
              Authentic Indian spices, crafted with tradition and love. Taste the difference in every meal.
            </p>
            <p className="text-xs text-white/50 mt-4 md:mt-auto pt-4">
              &copy; {currentYear} Shree Mahalaxmi Food Products. All Rights Reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm mb-6">
              <li><a href="#hero" className="hover:text-[#FFA500] transition-colors block py-1">Home</a></li>
              <li><a href="#products" className="hover:text-[#FFA500] transition-colors block py-1">Products</a></li>
              <li><a href="#about" className="hover:text-[#FFA500] transition-colors block py-1">About Us</a></li>
              <li><a href="#contact" className="hover:text-[#FFA500] transition-colors block py-1">Contact</a></li>
              <li><Link to="/shipping-policy" className="hover:text-[#FFA500] transition-colors block py-1">Shipping & Delivery Policy</Link></li>
            </ul>
            <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Contact Us</h4>
            <div className="text-sm text-center text-white/70">
              <p>Kandhavara<br/>Chikkaballapur, Karnataka</p>
              <p className="mt-2">
                <a href="tel:080-9823453" className="hover:text-[#FFA500] transition-colors">+91 8050625634</a>
              </p>
              <p className="mt-2">
                <a href="mailto:info@shreemahalaxmifoods.com" className="hover:text-[#FFA500] transition-colors">info@shreemahalaxmifoods.com</a>
              </p>
            </div>
          </div>

          {/* Middle: FSSAI Certification */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Certification</h4>
            <div className="bg-white/10 rounded-lg p-4 flex flex-col items-center gap-3">
              <img 
                src="/images/fssai.jpg" 
                alt="FSSAI Certified" 
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-fssai.jpg';
                }}
              />
              <div className="text-center">
                <p className="text-sm font-semibold text-white">FSSAI Certified</p>
                <p className="text-xs text-white/70">License No: 11225309000197</p>
              </div>
            </div>
          </div>

          {/* Right: Map */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-lg font-bold uppercase tracking-wider text-[#FFA500] mb-4">Location</h4>
            <div className="w-full max-w-sm h-48 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <LocationMap />
            </div>
          </div>
        </div>
      </footer>
      <div className="w-full bg-[#1A2634] text-center py-3 text-xs text-white/70">
        Developed by <span className="font-semibold text-[#FFA500]">Tech Astra</span> |
        Contact: <a href="mailto:vivekvernekar02@gmail.com" className="underline hover:text-[#FFA500]">contactus.techastra@gmail.com</a>,
      </div>
    </>
  );
}

export default Footer;
