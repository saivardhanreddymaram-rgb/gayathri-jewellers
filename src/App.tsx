import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';
import { PageSkeleton } from './components/ui/Skeleton';

// ─── Lazy-loaded pages ─────────────────────────────────────────────────────────
const AccountEntryPage    = lazy(() => import('./pages/AccountEntry').then(m => ({ default: m.AccountEntryPage })));
const HomePage            = lazy(() => import('./pages/Home').then(m => ({ default: m.HomePage })));
const WomenPage           = lazy(() => import('./pages/Women').then(m => ({ default: m.WomenPage })));
const MenPage             = lazy(() => import('./pages/Men').then(m => ({ default: m.MenPage })));
const ProductsPage        = lazy(() => import('./pages/Products').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage   = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetailPage })));
const WishlistPage        = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.WishlistPage })));
const CartPage            = lazy(() => import('./pages/Cart').then(m => ({ default: m.CartPage })));
const CheckoutPage        = lazy(() => import('./pages/Checkout').then(m => ({ default: m.CheckoutPage })));
const OrdersPage          = lazy(() => import('./pages/Orders').then(m => ({ default: m.OrdersPage })));
const OrderConfirmPage    = lazy(() => import('./pages/OrderConfirmation').then(m => ({ default: m.OrderConfirmationPage })));
const ProfilePage         = lazy(() => import('./pages/Profile').then(m => ({ default: m.ProfilePage })));
const AboutPage           = lazy(() => import('./pages/About').then(m => ({ default: m.AboutPage })));
const ContactPage         = lazy(() => import('./pages/Contact').then(m => ({ default: m.ContactPage })));
const AdminLayout         = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminOverview       = lazy(() => import('./pages/admin/AdminOverview').then(m => ({ default: m.AdminOverview })));
const AdminProducts       = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminCategories     = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminOrders         = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCustomers      = lazy(() => import('./pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminAdministrators = lazy(() => import('./pages/admin/AdminAdministrators').then(m => ({ default: m.AdminAdministrators })));
const AdminMetalRates     = lazy(() => import('./pages/admin/AdminMetalRates').then(m => ({ default: m.AdminMetalRates })));

// ─── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* ── Login page — only for guests. Logged-in users get redirected to /shop ── */}
        <Route path="/login" element={<GuestRoute><AccountEntryPage /></GuestRoute>} />

        {/* ── Home — public ── */}
        <Route path="/" element={<HomePage />} />

        {/* ── Public catalogue pages ── */}
        <Route path="/women"           element={<WomenPage />} />
        <Route path="/men"             element={<MenPage />} />
        <Route path="/products"        element={<ProductsPage />} />
        <Route path="/products/:slug"  element={<ProductDetailPage />} />
        <Route path="/about"           element={<AboutPage />} />
        <Route path="/contact"         element={<ContactPage />} />

        {/* ── Protected customer pages ── */}
        <Route path="/wishlist"  element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/cart"      element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout"  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/confirmation/:orderId" element={<ProtectedRoute><OrderConfirmPage /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* ── Admin portal ── */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
          <Route index        element={<AdminOverview />} />
          <Route path="products"       element={<AdminProducts />} />
          <Route path="categories"     element={<AdminCategories />} />
          <Route path="metal-rates"    element={<AdminMetalRates />} />
          <Route path="orders"         element={<AdminOrders />} />
          <Route path="customers"      element={<AdminCustomers />} />
          <Route path="administrators" element={<AdminAdministrators />} />
        </Route>

        {/* Legacy /home redirect */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#FAF6EE',
                color: '#3D2416',
                border: '1px solid #E8DDD4',
                borderRadius: '12px',
                fontFamily: 'Lato, system-ui, sans-serif',
                fontSize: '14px',
                boxShadow: '0 8px 24px rgba(61,36,22,0.12)',
              },
              success: { iconTheme: { primary: '#C9960F', secondary: '#FAF6EE' } },
              error:   { iconTheme: { primary: '#DC2626', secondary: '#FAF6EE' } },
            }}
          />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
