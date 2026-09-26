import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, ChevronDown, Settings } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { clsx } from 'clsx';

const NAV_LINKS = [
  { label: 'Home',      to: '/'        },
  { label: 'Jewellery', to: '/products'},
  { label: 'Women',     to: '/women'   },
  { label: 'Men',       to: '/men'     },
  { label: 'About',     to: '/about'   },
  { label: 'Contact',   to: '/contact' },
];

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const h = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [accountOpen]);

  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50); }, [searchOpen]);
  useEffect(() => { setMobileOpen(false); }, [navigate]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    setAccountOpen(false);
    await signOut();
    navigate('/login');
  };

  const wishlistCount = wishlistItems.length;

  return (
    <header className={clsx(
      'sticky top-0 z-40 bg-white transition-shadow duration-200',
      scrolled ? 'shadow-md' : 'border-b border-gray-100'
    )}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center h-14 sm:h-16 gap-2 sm:gap-4">

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-brown-800 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <div className="flex-1 flex lg:flex-none items-center">
            <Logo size="md" variant="dark" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5" aria-label="Primary navigation">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => clsx(
                  'px-3.5 py-2 rounded-lg text-sm font-sans font-medium transition-colors duration-150 whitespace-nowrap',
                  isActive ? 'text-brown-800 font-semibold bg-gray-50' : 'text-gray-600 hover:text-brown-800 hover:bg-gray-50'
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action icons — always visible */}
          <div className="flex items-center gap-0.5 sm:gap-1">

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="p-2.5 rounded-xl text-gray-600 hover:text-brown-800 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to={user ? '/wishlist' : '/login'}
              aria-label={`Wishlist${wishlistCount > 0 ? `, ${wishlistCount} items` : ''}`}
              className="relative p-2.5 rounded-xl text-gray-600 hover:text-brown-800 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to={user ? '/cart' : '/login'}
              aria-label={`Shopping bag${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              className="relative p-2.5 rounded-xl text-gray-600 hover:text-brown-800 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brown-800 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  className="flex items-center gap-1 p-2.5 rounded-xl text-gray-600 hover:text-brown-800 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px]"
                >
                  <User size={20} />
                  <ChevronDown size={13} className={clsx('hidden sm:block transition-transform duration-150', accountOpen && 'rotate-180')} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-brown-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link to="/profile"  onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><User size={15} className="text-gray-400"/> My Profile</Link>
                    <Link to="/orders"   onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><ShoppingBag size={15} className="text-gray-400"/> My Orders</Link>
                    {isAdmin && (
                      <Link to="/admin"  onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gold-600 hover:bg-gold-50 transition-colors"><Settings size={15}/> Admin Portal</Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={15}/> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" aria-label="Sign in" className="p-2.5 rounded-xl text-gray-600 hover:text-brown-800 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                <User size={20} />
              </Link>
            )}
          </div>
        </div>

        {/* Search bar — full width on mobile */}
        {searchOpen && (
          <div className="pb-3 px-0 animate-slide-up">
            <form onSubmit={handleSearch} role="search">
              <div className="relative">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jewellery…"
                  aria-label="Search products"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-brown-800 placeholder-gray-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-200"
                />
                <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-brown-800 min-w-[36px] min-h-[36px] flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile nav drawer — full screen overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />

          {/* Drawer */}
          <nav aria-label="Mobile navigation" className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-slide-in-right">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Logo size="sm" variant="dark" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-5 py-4 bg-gold-50 border-b border-gold-100">
                <p className="text-sm font-semibold text-brown-800">{user.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user.mobile}</p>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto py-2">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => clsx(
                    'flex items-center px-5 py-4 text-base font-sans font-medium transition-colors border-l-4',
                    isActive
                      ? 'text-gold-600 bg-gold-50 border-gold-500'
                      : 'text-gray-700 hover:bg-gray-50 border-transparent'
                  )}
                >
                  {link.label}
                </NavLink>
              ))}

              {user && (
                <>
                  <div className="mx-4 my-2 border-t border-gray-100" />
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 border-l-4 border-transparent">
                    <User size={17} className="text-gray-400" /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 border-l-4 border-transparent">
                    <ShoppingBag size={17} className="text-gray-400" /> My Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-5 py-4 text-sm text-gold-600 hover:bg-gold-50 border-l-4 border-transparent">
                      <Settings size={17} /> Admin Portal
                    </Link>
                  )}
                  <div className="mx-4 my-2 border-t border-gray-100" />
                  <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-5 py-4 text-sm text-red-600 hover:bg-red-50 border-l-4 border-transparent">
                    <LogOut size={17} /> Sign out
                  </button>
                </>
              )}

              {!user && (
                <>
                  <div className="mx-4 my-2 border-t border-gray-100" />
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-5 py-4 text-sm text-gold-600 font-semibold hover:bg-gold-50 border-l-4 border-transparent">
                    <User size={17} /> Sign In / Create Account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
