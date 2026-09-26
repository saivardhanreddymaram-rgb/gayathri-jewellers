import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, Shield, Menu, X, LogOut, ChevronRight, TrendingUp,
} from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/metal-rates', label: 'Metal Rates', icon: TrendingUp },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/administrators', label: 'Administrators', icon: Shield },
];

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-espresso-600/40 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-serif text-xl text-ivory">Gayathri</span>
            <span className="block font-sans text-[9px] tracking-[0.25em] uppercase text-gold-400">Admin Portal</span>
          </div>
          {onClose && (
            <button onClick={onClose} aria-label="Close sidebar" className="p-1.5 rounded-lg text-ivory/60 hover:text-ivory hover:bg-espresso-600/40 transition-colors lg:hidden">
              <X size={18} />
            </button>
          )}
        </div>
        {user && (
          <div className="mt-4 pt-4 border-t border-espresso-600/30">
            <p className="text-xs text-ivory/70 font-sans truncate">{user.name}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-gold-400 mt-0.5">
              <Shield size={10} /> Administrator
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-sans font-medium transition-all duration-150 mb-0.5 group',
              isActive
                ? 'bg-gold-600/20 text-gold-400 border border-gold-600/30'
                : 'text-ivory/60 hover:text-ivory hover:bg-espresso-600/30'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-gold-400' : 'text-ivory/50 group-hover:text-ivory/80'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-gold-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-espresso-600/30 shrink-0">
        <NavLink to="/" className="flex items-center gap-2 text-xs text-ivory/40 hover:text-ivory/70 transition-colors mb-3 font-sans">
          ← Back to Store
        </NavLink>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors font-sans w-full"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 xl:w-64 bg-espresso flex-col shrink-0 fixed inset-y-0 left-0 z-30" aria-label="Admin sidebar">
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-espresso-900/60" onClick={() => setSidebarOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-espresso z-50">
            <SidebarNav onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 xl:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-ivory-200 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="p-2 rounded-lg text-espresso hover:bg-espresso-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <Logo size="sm" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
