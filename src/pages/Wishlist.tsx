import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { AudienceBadge, CollectionBadge } from '../components/ui/Badge';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { Skeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';

export function WishlistPage() {
  const { items, loading, toggle } = useWishlist();
  const { addItem, hasItem } = useCart();
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'My Wishlist' }]} />
        <div className="mt-6 mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl text-espresso font-medium">My Wishlist</h1>
          {items.length > 0 && (
            <p className="text-sm text-espresso-400 font-sans">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <Skeleton className="w-full aspect-square rounded-none rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save jewellery pieces you love and come back to them anytime."
            action={{ label: 'Browse Collections', onClick: () => navigate('/products') }}
          />
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {items.map(({ id, product }) => {
              const inCart = hasItem(product.id);
              const inStock = product.available && product.stock > 0;
              return (
                <article key={id} className="card overflow-hidden flex flex-col group">
                  {/* Image */}
                  <div className="relative aspect-square bg-ivory-100 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-espresso-100" aria-hidden>◈</div>
                    )}
                    <button
                      onClick={() => toggle(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 border border-ivory-200 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex gap-1.5 flex-wrap">
                      <AudienceBadge audience={product.audience} />
                      <CollectionBadge collection={product.collection} />
                    </div>
                    <Link to={`/products/${product.slug}`} className="font-serif text-base text-espresso font-medium hover:text-gold-700 transition-colors line-clamp-2">
                      {product.name}
                    </Link>
                    <p className="text-xs text-espresso-400 font-sans">{product.subcategory}</p>
                    <p className="font-sans font-bold text-espresso mt-auto">₹{(product.price ?? 0).toLocaleString('en-IN')}</p>

                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={inCart ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth
                        leftIcon={<ShoppingBag size={14} />}
                        disabled={!inStock}
                        onClick={() => addItem(product.id)}
                      >
                        {inCart ? 'In Bag' : inStock ? 'Add to Bag' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
