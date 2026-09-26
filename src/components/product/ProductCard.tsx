import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { clsx } from 'clsx';
import { CollectionBadge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { user }             = useAuth();
  const { addItem, hasItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const inCart     = hasItem(product.id);
  const inStock    = product.available && product.stock > 0;

  const requireAuth = (action: () => void, actionType?: 'cart' | 'wishlist') => {
    if (!user) { 
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          productId: product.id,
          action: actionType
        } 
      }); 
      return; 
    }
    action();
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => toggle(product.id), 'wishlist');
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(async () => {
      if (!inStock) return;
      setAddingToCart(true);
      await addItem(product.id, 1);
      setAddingToCart(false);
    }, 'cart');
  };

  return (
    <article className={clsx(
      'bg-white rounded-2xl overflow-hidden flex flex-col',
      'border border-gray-100 shadow-card',
      'transition-shadow duration-200 active:shadow-card hover:shadow-card-hover',
      className
    )}>
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200" aria-hidden>◈</div>
          )}
        </Link>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-sans font-semibold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist button — large tap target */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          className={clsx(
            'absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center',
            'shadow-md transition-all duration-150',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
            wishlisted
              ? 'bg-red-50 text-red-500 border border-red-200'
              : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100'
          )}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1.5">
        {/* Collection badge */}
        <CollectionBadge collection={product.collection} />

        {/* Name */}
        <Link
          to={`/products/${product.slug}`}
          className="font-serif text-sm sm:text-base text-brown-800 font-semibold leading-snug hover:text-gold-600 transition-colors line-clamp-2 flex-1"
        >
          {product.name}
        </Link>

        {/* Subcategory */}
        <p className="text-xs text-gray-400 font-sans">{product.subcategory}</p>

        {/* Price / Weight + Add to cart */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          {product.collection === 'Gold' || product.collection === 'Silver' ? (
            <p className="font-sans font-bold text-brown-800 text-sm sm:text-base">
              {product.weight ? `${product.weight} g` : 'Weight N/A'}
            </p>
          ) : (
            <p className="font-sans font-bold text-brown-800 text-sm sm:text-base">
              ₹{product.price?.toLocaleString('en-IN') ?? '0'}
            </p>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart}
            aria-label={inCart ? `${product.name} is in your cart` : `Add ${product.name} to cart`}
            className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
              inCart
                ? 'bg-brown-800 text-white'
                : inStock
                ? 'bg-gold-100 text-gold-700 hover:bg-gold-500 hover:text-white active:scale-95 border border-gold-200'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            )}
          >
            {addingToCart
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : <ShoppingBag size={16} />
            }
          </button>
        </div>
      </div>
    </article>
  );
}
