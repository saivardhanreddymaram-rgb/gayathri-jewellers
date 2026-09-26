import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Scale, Gem, Tag, CheckCircle, XCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { ProductCard } from '../components/product/ProductCard';
import { AudienceBadge, CollectionBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/EmptyState';
import { getProductBySlug, getRelatedProducts } from '../api/products';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { extractErrorMessage } from '../api/client';
import type { Product } from '../types';

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const safeImages = images.length ? images : [''];

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square bg-ivory-100 rounded-2xl overflow-hidden border border-ivory-200">
        {safeImages[active] ? (
          <img
            src={safeImages[active]}
            alt={`${name} — image ${active + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-espresso-100" aria-hidden>◈</div>
        )}
      </div>
      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Product images">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={active === i}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${active === i ? 'border-gold-500' : 'border-transparent hover:border-espresso-200'}`}
            >
              {img ? (
                <img src={img} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-ivory-100" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addItem, hasItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true); setError(null);
    try {
      const { product } = await getProductBySlug(slug);
      setProduct(product);
      // Fetch related
      try {
        const { products } = await getRelatedProducts(slug);
        setRelated(products.filter((p) => p.id !== product.id).slice(0, 4));
      } catch { /* silent */ }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [slug]);

  // Execute pending action after login
  useEffect(() => {
    const state = location.state as { executeAction?: 'cart' | 'wishlist'; productId?: number } | undefined;
    if (user && product && state?.executeAction && state?.productId === product.id) {
      if (state.executeAction === 'cart') {
        addItem(product.id).catch(() => {});
      } else if (state.executeAction === 'wishlist') {
        toggle(product.id);
      }
      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [user, product, location.state, addItem, toggle, navigate, location.pathname]);

  const requireAuth = (action: () => void, actionType?: 'cart' | 'wishlist') => {
    if (!user) { 
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          productId: product?.id,
          productSlug: slug,
          action: actionType
        } 
      }); 
      return; 
    }
    action();
  };

  const handleAddToCart = async () => {
    if (!product) return;
    requireAuth(async () => {
      setAddingToCart(true);
      await addItem(product.id);
      setAddingToCart(false);
    }, 'cart');
  };

  const handleWishlist = () => {
    if (!product) return;
    requireAuth(() => toggle(product.id), 'wishlist');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <ProductDetailSkeleton />
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <ErrorState message={error ?? 'Product not found.'} onRetry={fetchProduct} />
        </div>
      </PageLayout>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const inCart = hasItem(product.id);
  const inStock = product.available && product.stock > 0;

  const audienceRoute = product.audience === 'Women' ? '/women' : '/men';

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Home', to: '/' },
          { label: product.audience === 'Women' ? "Women's Jewellery" : "Men's Jewellery", to: audienceRoute },
          { label: product.collection, to: `${audienceRoute}?collection=${encodeURIComponent(product.collection)}` },
          { label: product.name },
        ]} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 mb-8 flex items-center gap-2 text-sm font-sans text-espresso-400 hover:text-espresso transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery */}
          <ImageGallery images={product.images} name={product.name} />

          {/* Details */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <AudienceBadge audience={product.audience} />
              <CollectionBadge collection={product.collection} />
              <span className="text-xs text-espresso-400 font-sans">{product.subcategory}</span>
            </div>

            {/* Name */}
            <h1 className="font-serif text-3xl sm:text-4xl text-espresso font-medium leading-tight">
              {product.name}
            </h1>

            {/* Price / Weight */}
            {product.collection === 'Gold' || product.collection === 'Silver' ? (
              <div className="flex items-baseline gap-3">
                <p className="font-sans text-2xl font-bold text-brown-800">
                  {product.weight ? `${product.weight} g` : 'Weight N/A'}
                </p>
                <span className="text-sm text-gray-400 font-sans">Weight</span>
              </div>
            ) : (
              <p className="font-sans text-2xl font-bold text-brown-800">
                ₹{product.price?.toLocaleString('en-IN') ?? '0'}
              </p>
            )}

            {/* Availability */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <><CheckCircle size={16} className="text-green-600" /><span className="text-sm font-sans text-green-700 font-medium">In Stock ({product.stock} available)</span></>
              ) : (
                <><XCircle size={16} className="text-red-500" /><span className="text-sm font-sans text-red-600 font-medium">Out of Stock</span></>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              {product.purity && (
                <div className="flex items-start gap-2.5 p-3 bg-ivory-100 rounded-xl">
                  <Gem size={15} className="text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-espresso-400 font-sans">Purity / Material</p>
                    <p className="text-sm text-espresso font-medium font-sans">{product.purity}</p>
                  </div>
                </div>
              )}
              {product.weight && (
                <div className="flex items-start gap-2.5 p-3 bg-ivory-100 rounded-xl">
                  <Scale size={15} className="text-gold-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-espresso-400 font-sans">Weight</p>
                    <p className="text-sm text-espresso font-medium font-sans">{product.weight}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5 p-3 bg-ivory-100 rounded-xl">
                <Tag size={15} className="text-gold-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-espresso-400 font-sans">Collection</p>
                  <p className="text-sm text-espresso font-medium font-sans">{product.collection}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="font-sans text-sm font-semibold text-espresso mb-2">Description</h2>
                <p className="text-sm font-sans text-espresso-400 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* CTA — desktop */}
            <div className="hidden lg:flex flex-col gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<ShoppingBag size={18} />}
                loading={addingToCart}
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                {inCart ? 'Added to Bag' : inStock ? 'Add to Bag' : 'Out of Stock'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                leftIcon={<Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />}
                onClick={handleWishlist}
                className={wishlisted ? 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400' : ''}
              >
                {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </Button>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-ivory-200" aria-label="Related products">
            <h2 className="section-title mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-4 bg-ivory/95 backdrop-blur-sm border-t border-ivory-200 flex gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`w-12 shrink-0 px-0 ${wishlisted ? 'border-red-300 text-red-600' : ''}`}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </Button>
        <Button
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<ShoppingBag size={17} />}
          loading={addingToCart}
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          {inCart ? 'Added to Bag' : inStock ? 'Add to Bag' : 'Out of Stock'}
        </Button>
      </div>
    </PageLayout>
  );
}
