import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';
import { extractErrorMessage } from '../api/client';
import { useAuth } from './AuthContext';
import type { WishlistItem } from '../types';
import toast from 'react-hot-toast';

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
}

type WishlistAction =
  | { type: 'SET_ITEMS'; items: WishlistItem[] }
  | { type: 'SET_LOADING'; loading: boolean };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_ITEMS': return { ...state, items: action.items };
    case 'SET_LOADING': return { ...state, loading: action.loading };
    default: return state;
  }
}

interface WishlistContextValue extends WishlistState {
  toggle: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [], loading: false });

  const refresh = useCallback(async () => {
    if (!user) { dispatch({ type: 'SET_ITEMS', items: [] }); return; }
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const { items } = await getWishlist();
      dispatch({ type: 'SET_ITEMS', items });
    } catch {
      // silent
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (productId: number) => {
    const alreadyIn = state.items.some((i) => i.product.id === productId);
    try {
      if (alreadyIn) {
        const { items } = await removeFromWishlist(productId);
        dispatch({ type: 'SET_ITEMS', items });
        toast.success('Removed from wishlist');
      } else {
        const { items } = await addToWishlist(productId);
        dispatch({ type: 'SET_ITEMS', items });
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }, [state.items]);

  const isWishlisted = useCallback(
    (productId: number) => state.items.some((i) => i.product.id === productId),
    [state.items]
  );

  return (
    <WishlistContext.Provider value={{ ...state, toggle, isWishlisted, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
