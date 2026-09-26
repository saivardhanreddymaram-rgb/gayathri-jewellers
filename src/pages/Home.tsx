import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, Gem } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { ProductCard } from '../components/product/ProductCard';
import { MetalRatesSection } from '../components/home/MetalRatesSection';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import {
  getFeaturedProducts,
  getBestsellerProducts,
  getTopValuableProducts,
} from '../api/products';
import type { Product } from '../types';

// ─── Collection Cards Section (matches screenshot exactly) ───────────────────

const COLLECTION_DATA = [
  {
    label: 'Gold Jewellery',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
    link: '/products?collection=Gold',
  },
  {
    label: 'Silver Jewellery',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
    link: '/products?collection=Silver',
  },
  {
    label: 'One Gram Gold',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
    link: '/products?collection=One+Gram+Gold',
  },
  {
    label: 'Stones',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
    link: '/products?collection=Stones',
  },
];

function ExploreSection() {
  return (
    <section className="py-14 px-4 sm:px-6 max-w-7xl mx-auto" aria-label="Explore Collections">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brown-800 tracking-wide mb-3">
          Explore Our Collections
        </h2>
        <p className="text-sm text-gray-500 font-sans">
          Discover our handcrafted jewellery collections.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {COLLECTION_DATA.map(col => (
          <div
            key={col.label}
            className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col group"
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
              <img
                src={col.image}
                alt={col.label}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 sm:p-5 flex flex-col items-center gap-2 sm:gap-4 text-center">
              <h3 className="font-serif text-sm sm:text-lg font-bold text-brown-800 tracking-wide">
                {col.label}
              </h3>
              <Link to={col.link}>
                <Button variant="primary" size="sm" className="text-xs sm:text-sm px-3 sm:px-5">
                  View Collection
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Audience cards (Women / Men) ─────────────────────────────────────────────

function AudienceCards() {
  return (
    <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto" aria-label="Shop by audience">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Women */}
        <Link
          to="/women"
          className="group relative bg-brown-800 rounded-2xl overflow-hidden aspect-video flex items-end"
          aria-label="Browse Women's Jewellery"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-800/30 to-transparent" />
          <div className="relative p-7">
            <p className="font-sans text-gold-300 text-xs tracking-widest uppercase mb-1">For Her</p>
            <h2 className="font-serif text-3xl text-white font-bold mb-3">Women's Collection</h2>
            <p className="text-white/60 text-sm font-sans mb-4">Gold, Silver, One Gram Gold &amp; Stones</p>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={15} />}>
              Shop Now
            </Button>
          </div>
        </Link>

        {/* Men */}
        <Link
          to="/men"
          className="group relative bg-brown-700 rounded-2xl overflow-hidden aspect-video flex items-end"
          aria-label="Browse Men's Jewellery"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-700/30 to-transparent" />
          <div className="relative p-7">
            <p className="font-sans text-gold-300 text-xs tracking-widest uppercase mb-1">For Him</p>
            <h2 className="font-serif text-3xl text-white font-bold mb-3">Men's Collection</h2>
            <p className="text-white/60 text-sm font-sans mb-4">Gold, Silver &amp; Stones</p>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight size={15} />}>
              Shop Now
            </Button>
          </div>
        </Link>
      </div>
    </section>
  );
}

// ─── Product Section ──────────────────────────────────────────────────────────

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  viewAllLink: string;
}

function ProductSection({ title, subtitle, products, loading, error, onRetry, viewAllLink }: ProductSectionProps) {
  const navigate = useNavigate();
  return (
    <section className="py-12 border-t border-gray-100 bg-white" aria-label={title}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-sans font-semibold tracking-widest uppercase text-gold-500 mb-1">{subtitle}</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-brown-800 font-bold">{title}</h2>
          </div>
          <Link to={viewAllLink} className="hidden sm:inline-flex items-center gap-1.5 text-sm font-sans font-semibold text-gold-500 hover:text-gold-600 transition-colors shrink-0">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading && <ProductGridSkeleton count={4} />}
        {!loading && error && <ErrorState message={error} onRetry={onRetry} />}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="font-serif text-lg text-gray-400">Coming soon — check back shortly.</p>
          </div>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Button variant="outline" onClick={() => navigate(viewAllLink)}>View all</Button>
        </div>
      </div>
    </section>
  );
}

// ─── Hero banner ──────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="bg-white border-b border-gray-100 py-16 sm:py-20" aria-label="Hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <p className="font-sans text-gold-500 text-xs tracking-[0.3em] uppercase mb-4 font-semibold">
          Premium Indian Jewellery
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-brown-800 font-bold leading-tight mb-5">
          Timeless Pieces,<br />
          <span className="text-gold-500">Lasting Stories</span>
        </h1>
        <p className="text-gray-500 font-sans text-sm sm:text-lg leading-relaxed max-w-xl mx-auto mb-8">
          Discover our handcrafted collection of Gold, Silver, One Gram Gold, and Stones jewellery.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link to="/women">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Shop Women's
            </Button>
          </Link>
          <Link to="/men">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight size={18} />}>
              Shop Men's
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── CTA banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="bg-brown-800 py-14 text-center" aria-label="Contact us">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <h2 className="font-serif text-3xl text-white font-bold mb-4">Visit Us Today</h2>
        <p className="text-white/60 font-sans text-sm leading-relaxed mb-7">
          Experience our jewellery in person. We'd love to help you find the perfect piece.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5">
          <a
            href="tel:+916304478352"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white text-sm font-sans font-semibold hover:bg-white/20 transition-colors min-h-[48px]"
          >
            📞 +91 63044 78352
          </a>
          <Link to="/contact">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
              Contact Us
            </Button>
          </Link>
        </div>
        <a
          href="https://maps.app.goo.gl/nqpbGuvtZkEHYJuBA"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-400 hover:text-gold-300 text-sm font-sans transition-colors underline underline-offset-2"
        >
          📍 Find us on Google Maps ↗
        </a>
      </div>
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const [topValuable,  setTopValuable]  = useState<Product[]>([]);
  const [featured,     setFeatured]     = useState<Product[]>([]);
  const [bestsellers,  setBestsellers]  = useState<Product[]>([]);
  const [loadingTV,    setLoadingTV]    = useState(true);
  const [loadingFt,    setLoadingFt]    = useState(true);
  const [loadingBS,    setLoadingBS]    = useState(true);
  const [errorTV,      setErrorTV]      = useState<string | null>(null);
  const [errorFt,      setErrorFt]      = useState<string | null>(null);
  const [errorBS,      setErrorBS]      = useState<string | null>(null);

  const fetchTV = useCallback(async () => {
    setLoadingTV(true); setErrorTV(null);
    try { const { products } = await getTopValuableProducts(); setTopValuable(products); }
    catch { setErrorTV('Could not load products.'); }
    finally { setLoadingTV(false); }
  }, []);

  const fetchFt = useCallback(async () => {
    setLoadingFt(true); setErrorFt(null);
    try { const { products } = await getFeaturedProducts(); setFeatured(products); }
    catch { setErrorFt('Could not load products.'); }
    finally { setLoadingFt(false); }
  }, []);

  const fetchBS = useCallback(async () => {
    setLoadingBS(true); setErrorBS(null);
    try { const { products } = await getBestsellerProducts(); setBestsellers(products); }
    catch { setErrorBS('Could not load products.'); }
    finally { setLoadingBS(false); }
  }, []);

  useEffect(() => { fetchTV(); fetchFt(); fetchBS(); }, [fetchTV, fetchFt, fetchBS]);

  return (
    <PageLayout>
      <Hero />
      <MetalRatesSection />
      <ExploreSection />
      <AudienceCards />
      <ProductSection
        title="Top &amp; Valuable Jewellery"
        subtitle="Owner's Picks"
        products={topValuable}
        loading={loadingTV}
        error={errorTV}
        onRetry={fetchTV}
        viewAllLink="/products?topValuable=true"
      />
      <ProductSection
        title="Featured Jewellery"
        subtitle="Curated For You"
        products={featured}
        loading={loadingFt}
        error={errorFt}
        onRetry={fetchFt}
        viewAllLink="/products?featured=true"
      />
      <ProductSection
        title="Best Sellers"
        subtitle="Most Loved"
        products={bestsellers}
        loading={loadingBS}
        error={errorBS}
        onRetry={fetchBS}
        viewAllLink="/products?bestseller=true"
      />
      <CTABanner />
    </PageLayout>
  );
}
