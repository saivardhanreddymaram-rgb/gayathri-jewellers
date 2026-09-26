import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { CollectionBadge } from '../components/ui/Badge';
import { useCart } from '../contexts/CartContext';
import type { CartItem } from '../types';

function CartLineItem({ item }: { item: CartItem }) {
  const { updateItem, removeItem } = useCart();
  const { product, quantity, id }  = item;

  return (
    <div className="flex gap-3 sm:gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="shrink-0 w-18 h-18 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100" style={{ width: 72, height: 72 }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xl text-gray-200" aria-hidden>◈</div>
        }
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/products/${product.slug}`} className="font-serif text-sm sm:text-base text-brown-800 font-semibold hover:text-gold-600 transition-colors line-clamp-2 block leading-snug">
              {product.name}
            </Link>
            <div className="flex items-center gap-1.5 mt-1">
              <CollectionBadge collection={product.collection} />
            </div>
          </div>
          <button
            onClick={() => removeItem(id)}
            aria-label={`Remove ${product.name}`}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-auto">
          {/* Quantity */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => quantity > 1 ? updateItem(id, quantity - 1) : removeItem(id)}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-brown-800 disabled:opacity-40"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-sans font-semibold text-brown-800">{quantity}</span>
            <button
              onClick={() => updateItem(id, quantity + 1)}
              aria-label="Increase quantity"
              disabled={quantity >= product.stock}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors text-brown-800 disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="font-sans font-bold text-brown-800 text-sm sm:text-base">
            ₹{((product.price ?? 0) * quantity).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, error, refresh } = useCart();
  const items = cart?.items ?? [];

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-serif text-2xl sm:text-3xl text-brown-800 font-bold">Shopping Bag</h1>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-4 py-4 border-b border-gray-100">
                <Skeleton className="w-[72px] h-[72px] rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={refresh} />}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            description="Add jewellery to your bag and it'll appear here."
            action={{ label: 'Browse Jewellery', onClick: () => navigate('/products') }}
          />
        )}

        {!loading && !error && items.length > 0 && (
          /* On mobile: items stacked on top, summary below.
             On desktop: items on left (2/3), summary on right (1/3) */
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Items list */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-card p-4 sm:p-6">
              <p className="text-sm text-gray-400 font-sans mb-2">{items.length} item{items.length !== 1 ? 's' : ''}</p>
              {items.map(item => <CartLineItem key={item.id} item={item} />)}
            </div>

            {/* Order summary — sticks to bottom on mobile, sticky on desktop */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 lg:sticky lg:top-24">
                <h2 className="font-serif text-xl text-brown-800 font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm font-sans mb-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-brown-800">₹{(cart?.subtotal ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="text-gray-400 text-xs italic">At checkout</span>
                  </div>
                  <div className="flex justify-between font-bold text-brown-800 text-base pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{(cart?.subtotal ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button
                  variant="primary" fullWidth size="lg"
                  rightIcon={<ArrowRight size={18} />}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <Link to="/products" className="block text-center mt-3 text-sm font-sans text-gold-600 hover:text-gold-700 transition-colors py-2">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
