import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brown-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

        {/* Brand */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1">
          <Logo size="md" variant="light" />
          <p className="text-sm text-white/60 leading-relaxed font-sans mt-4 max-w-xs">
            Premium Indian jewellery crafted with tradition and elegance. Every piece tells a story.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="#" aria-label="Instagram" className="p-2 rounded-lg bg-white/10 hover:bg-gold-500 transition-colors">
              <Instagram size={17} />
            </a>
            <a href="#" aria-label="Facebook"  className="p-2 rounded-lg bg-white/10 hover:bg-gold-500 transition-colors">
              <Facebook size={17} />
            </a>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h3 className="font-serif text-base font-semibold text-gold-400 mb-4">Collections</h3>
          <ul className="space-y-2.5 text-sm text-white/60 font-sans">
            <li><Link to="/women?collection=Gold"          className="hover:text-gold-400 transition-colors">Women's Gold</Link></li>
            <li><Link to="/women?collection=Silver"        className="hover:text-gold-400 transition-colors">Women's Silver</Link></li>
            <li><Link to="/women?collection=One+Gram+Gold" className="hover:text-gold-400 transition-colors">One Gram Gold</Link></li>
            <li><Link to="/women?collection=Stones"        className="hover:text-gold-400 transition-colors">Stones</Link></li>
            <li><Link to="/men?collection=Gold"            className="hover:text-gold-400 transition-colors">Men's Gold</Link></li>
            <li><Link to="/men?collection=Silver"          className="hover:text-gold-400 transition-colors">Men's Silver</Link></li>
          </ul>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-serif text-base font-semibold text-gold-400 mb-4">Quick Links</h3>
          <ul className="space-y-2.5 text-sm text-white/60 font-sans">
            <li><Link to="/"        className="hover:text-gold-400 transition-colors">Home</Link></li>
            <li><Link to="/products" className="hover:text-gold-400 transition-colors">All Jewellery</Link></li>
            <li><Link to="/about"   className="hover:text-gold-400 transition-colors">Our Story</Link></li>
            <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Contact</Link></li>
            <li><Link to="/orders"  className="hover:text-gold-400 transition-colors">My Orders</Link></li>
            <li><Link to="/profile" className="hover:text-gold-400 transition-colors">My Account</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif text-base font-semibold text-gold-400 mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-white/60 font-sans">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-gold-400 mt-0.5 shrink-0" />
              <span>Visit our store for a personalised consultation</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-gold-400 shrink-0" />
              <a href="tel:+916304478352" className="hover:text-gold-400 transition-colors">+91 63044 78352</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-gold-400 shrink-0" />
              <a href="mailto:gayathrijewellers.in@gmail.com" className="hover:text-gold-400 transition-colors text-xs break-all">gayathrijewellers.in@gmail.com</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-gold-400 mt-0.5 shrink-0" />
              <a href="https://maps.app.goo.gl/nqpbGuvtZkEHYJuBA" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 transition-colors text-xs leading-relaxed">
                View on Google Maps ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30 font-sans">
          <p>© {year} Gayathri Jewellers. All rights reserved.</p>
          <p>Handcrafted jewellery — made with love and tradition.</p>
        </div>
      </div>
    </footer>
  );
}
